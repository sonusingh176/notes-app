import openai from "../config/openai.js";
import {
    countApplications,
    countApplicationTool
} from "../services/jobToolDefinitions.js";


/*
|--------------------------------------------------------------------------
| ASK AI
|--------------------------------------------------------------------------
|
| POST /api/ai/ask
|
| User sends:
|
| {
|     "question": "How many jobs did I apply for?"
| }
|
|--------------------------------------------------------------------------
*/

const askAI = async (req, res, next) => {

    try {

        const { question } = req.body;

        // return console.log(req.body);

        /*
        |--------------------------------------------------------------------------
        | BASIC VALIDATION
        |--------------------------------------------------------------------------
        */

        if (!question || typeof question !== "string") {

            return res.status(400).json({
                success: false,
                message: "Question is required."
            });

        }

        /*
        |--------------------------------------------------------------------------
        | SEND USER QUESTION TO OPENAI
        |--------------------------------------------------------------------------
        |
        | We provide:
        |
        | 1. instructions
        | 2. user question
        | 3. available tools
        |
        |--------------------------------------------------------------------------
        */

        // Render server UTC me chalta hai, isliye India ki date explicitly nikalo
        const now = new Date();
        const today = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD
        const weekday = now.toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Kolkata" });


        let response = await openai.responses.create({

            // We can change the model later according to cost/performance.
             //  model: "gpt-5.5",
            model: "openai/gpt-5",
               max_output_tokens: 1000,

            /*
            |--------------------------------------------------------------------------
            | SYSTEM INSTRUCTIONS
            |--------------------------------------------------------------------------
            */

            instructions:
                // "You are an AI assistant for a job application tracking system. " +
                // "Answer questions using the user's job application data when needed. " +
                // "If the user asks how many applications they have, use the " +
                // "count_application tool. " +
                // "Never ask the user for their user ID. " +
                // "The backend provides the correct logged-in user automatically.",
                "You are an AI assistant for a job application tracking system. " +
                `Today is ${weekday}, ${today} (India time). ` +
                "'Last week' means the previous full week, Monday to Sunday. " +
                "Always pass dates as YYYY-MM-DD. " +
                "For counts of applications, always use the count_application tool. " +
                "Never ask the user for their user ID.",

            /*
            |--------------------------------------------------------------------------
            | USER QUESTION
            |--------------------------------------------------------------------------
            */

            input: question,

            /*
            |--------------------------------------------------------------------------
            | AVAILABLE TOOLS
            |--------------------------------------------------------------------------
            */

            tools: [
                countApplicationTool
            ]

        });


        // return console.log(response);

        /*
        |--------------------------------------------------------------------------
        | CHECK WHETHER AI WANTS TO CALL A TOOL
        |--------------------------------------------------------------------------
        |
        | The AI might return:
        |
        | type = "function_call"
        |
        | That means:
        |
        | "Backend, please execute this function."
        |
        |--------------------------------------------------------------------------
        */

        for (const item of response.output) {

            if (item.type === "function_call") {

                /*
                |--------------------------------------------------------------------------
                | CHECK WHICH TOOL AI REQUESTED
                |--------------------------------------------------------------------------
                */

                if (item.name === "count_application") {

                    /*
                    |--------------------------------------------------------------------------
                    | PARSE AI GENERATED ARGUMENTS
                    |--------------------------------------------------------------------------
                    |
                    | Example AI arguments:
                    |
                    | {
                    |     "fromDate": "2026-09-28",
                    |     "toDate": "2026-10-04",
                    |     "status": null
                    | }
                    |
                    |--------------------------------------------------------------------------
                    */

                    const argumentsFromAI = JSON.parse(item.arguments);


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

                    const toolResult = await countApplications(
                        req.user._id,
                        argumentsFromAI
                    );


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

                    response = await openai.responses.create({

                        model: "gpt-5.5",
                      
                        max_output_tokens: 200,

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
                                ...response.output,

                            {
                                type: "function_call_output",

                                // Must match the function call ID returned by AI.
                                call_id: item.call_id,

                                // Convert our JavaScript object into JSON text.
                                output: JSON.stringify(toolResult)
                            }
                        ],

                        // Send tools again for the continuation.
                        tools: [
                            countApplicationTool
                        ]
                    });

                }
            }
        }


        /*
        |--------------------------------------------------------------------------
        | FINAL AI ANSWER
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({

            success: true,

            question,

            // output_text gives us the final natural-language answer.
            answer: response.output_text
        });


    } catch (error) {

        next(error);

    }
};


export {
    askAI
};