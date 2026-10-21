import openai from "../config/openai.js";
import { toolDefinitions, toolHandlers } from "../tools/index.js";

// model ka naam ek hi jagah, badalna ho to yahin badlo
const MODEL = "openai/gpt-5";


// WHAT: system instructions banata hai (rules + aaj ki date).
// WHY date: LLM ko aaj ki date nahi pata hoti. Date na dein to "last week" ki range
//      wo andaze se bana dega aur galat count aayega.
// WHY Asia/Kolkata: Render server UTC me chalta hai, raat me India aur UTC ki date alag ho sakti hai.

// India ki date + instructions (Render server UTC me chalta hai)
function buildInstructions() {
  const now = new Date();
  const today = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const weekday = now.toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Kolkata" });

  return (
    "You are an AI assistant for a job application tracking system. " +
    `Today is ${weekday}, ${today} (India time). ` +
    "'Last week' means the previous full week, Monday to Sunday. " +
    "Always pass dates as YYYY-MM-DD. " +
    "For counts of applications, always use the count_application tool. " +
    "Never ask the user for their user ID."+

    "For counts of applications, always use the count_application tool. " +
    "For details of latest/recent applications, use the get_recent_applications tool. " +
    // WHY: tool na ho to LLM user se data maangne lagta hai, ye line us behavior ko rokti hai
    "If no tool can answer the question, say you cannot do that yet. " +
    "Never ask the user to provide their application data or their user ID."+
 
    // Yahan naya instruction add kiya gaya hai jo simple greetings ko short rakhega:
    "Always detect the user's language and respond concisely. " +
    "If the user sends a simple greeting (like 'hi', 'hello', 'namaste', or equivalent in any language), " +
    "reply with a short, friendly greeting in that exact same language. " +
    "Do not list features, menus, bullet points, or examples unless the user explicitly asks for help."
  );
}

// WHAT: user ke sawal ka jawab deta hai, zaroorat ho to DB tool chala kar.
// WHY userId alag parameter: userId controller se (JWT wale req.user se) aati hai, LLM se nahi.
//      Warna prompt injection se koi dusre user ka data nikalwa sakta hai.

export async function askAssistant(userId, question) {
  // STEP 1: sawal + tools ki list LLM ko bhejo.
  // WHY max_output_tokens 2000: GPT-5 ki "soch" (reasoning) ke tokens bhi isi limit me ginte hain,
  //      kam rakha to soch me hi khatam ho kar jawab khaali aa sakta hai.

  let response = await openai.responses.create({
    model: MODEL,
    max_output_tokens: 500, // reasoning tokens bhi isi me ginte hain
    instructions: buildInstructions(),
    input: question,
    tools: toolDefinitions,
  });

  // STEP 2: dekho LLM ne tool maanga hai ya nahi.
  for (const item of response.output) {
     // WHY skip: output me "reasoning" aur "message" jaise aur type bhi hote hain, unse kaam nahi.
    if (item.type !== "function_call") continue;
    /*
    |--------------------------------------------------------------------------
    | CHECK WHICH TOOL AI REQUESTED
    | STEP 3: LLM ne jis naam ka tool maanga, registry se uska function dhundo.
    |--------------------------------------------------------------------------
    */
    const handler = toolHandlers[item.name];
    // WHY JSON.parse: LLM inputs (arguments) text ki shakl me bhejta hai, object banana padta hai.
    const args = JSON.parse(item.arguments);

    /*
    |--------------------------------------------------------------------------
    | EXECUTE OUR DATABASE FUNCTION
    |--------------------------------------------------------------------------
    |
    | VERY IMPORTANT:
    |
    | We pass req.user._id here.
    |
    | The AI cannot choose the user.
    |
    |--------------------------------------------------------------------------
    */
    // STEP 4: tool chalao. Handler na mile (LLM ne galat naam bheja) to crash nahi,
    //      error object bhej do, model khud sambhal lega.
    const toolResult = handler
      ? await handler(userId, args)
      : { error: `Unknown tool: ${item.name}` };

      /*
        |--------------------------------------------------------------------------
        | SEND TOOL RESULT BACK TO OPENAI
        |--------------------------------------------------------------------------
        |
        | Example:
        |
        | {
        |     count: 5
        | }
        |
        |--------------------------------------------------------------------------
        */
    // OpenRouter stateless hai, isliye poori conversation input me bhejo

    // STEP 5: tool ka result LLM ko wapas do taaki wo final jawab likh sake.
    // WHY poori conversation input me: OpenRouter stateless hai (previous_response_id support
    //      nahi karta, 400 error deta hai), isliye server ko history yaad nahi rehti, hume bhejni padti hai.
 
    response = await openai.responses.create({
      model: MODEL,
      max_output_tokens: 500,
      instructions:
        "Answer the user's question using the database result. " +
        "Keep the answer simple and accurate.",
            /*
                |--------------------------------------------------------------------------
                | previous_response_id
                |--------------------------------------------------------------------------
                |
                | This tells OpenAI:
                |
                | "Continue the previous response after receiving
                | the function result."
                |
                |--------------------------------------------------------------------------
                */

                //  previous_response_id: response.id,

                // previous_response_id ko comment kiya hai because hum openrouter use kar rahe hai or ye support nahi krta(OpenRouter 400 error deta hai).
                // Uski jagah poori conversation khud bhejo:input me.

                /*
                |--------------------------------------------------------------------------
                | TOOL OUTPUT
                |--------------------------------------------------------------------------
                */
      input: [
        // 1. user ka original sawal
        { role: "user", content: question },
         // 2. model ka pehla output (reasoning + function_call), jaisa mila waisa hi
         // 2. LLM ka pehla output (reasoning + function_call), jaisa mila waisa hi.
        //    WHY: model ko apni soch wapas chahiye, aur function_call se hi pata chalta
        //    hai ki neeche wala result kis request ka hai.
        ...response.output,
         // 3. tool ka result.
        //    call_id match karna zaroori hai, isi se result sahi request se judta hai.
     
        {
          type: "function_call_output",
           // Must match the function call ID returned by AI.
          call_id: item.call_id,
           // Convert our JavaScript object into JSON text.
          output: JSON.stringify(toolResult),// object ko text me badalna padta hai
        },
      ],
        // Send tools again for the continuation.
        // WHY tools dobara: continuation call me bhi tools ki list dena zaroori hai.
      tools: toolDefinitions,
    });
  }


/*
|--------------------------------------------------------------------------
| FINAL AI ANSWER
|--------------------------------------------------------------------------
*/
  return response.output_text;
}