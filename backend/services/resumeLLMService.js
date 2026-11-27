// ============================================================
// RESUME LLM SERVICE
// ============================================================
// WHAT: Resume ka text LLM ko bhejta hai aur wapas schema wala JSON leta hai.
//
// Is file ka kaam sirf itna hai:
//   resume text  ->  LLM  ->  JSON object
//
// JSON ko check (validate) karna agle step (Step 5) me hoga.
// Abhi jo JSON LLM de, wahi return kar dete hain.
// ============================================================

// Wahi LLM client jo chatbot me use ho raha hai (OpenRouter se baat karta hai)
import openai from "../config/openai.js";

// Step 2 wala schema (JSON kaisa hona chahiye)
import { resumeProfileSchema } from "./resumeProfileSchema.js";

// Step 3 wale instructions aur resume packaging
import { RESUME_EXTRACTION_INSTRUCTIONS, buildResumeInput } from "./resumePrompt.js";

// Model ka naam ek jagah, badalna ho to yahin badlo.
// WHY gpt-4.1-mini: ye "soch" (reasoning) wala model nahi hai, to token kam
// jaate hain, kharcha kam hota hai, aur temperature 0 bhi chalta hai.
const MODEL = "openai/gpt-4.1-mini";

// WHAT: status ke saath error banata hai.
// WHY 502: 502 ka matlab "bahar ki service (AI) se dikkat aayi".
// Hamara global errorHandler is status ko user tak bhej deta hai.
const aiError = (message) => Object.assign(new Error(message), { status: 502 });

export async function extractProfileFromText(resumeText) {
  let response;

  try {
    // ---------- LLM ko call ----------
    response = await openai.responses.create({
      model: MODEL,

      // temperature 0 = har baar sabse pakka jawab (extraction me creativity nahi chahiye)
      temperature: 0,

      // JSON ka size chhota hota hai, 2000 tokens kaafi hain
      max_output_tokens: 2000,

      // Kaam ka manual (Step 3) - ye hamesha same rehta hai
      instructions: RESUME_EXTRACTION_INSTRUCTIONS,

      // Asli resume text, <resume> tags ke andar (Step 3)
      input: buildResumeInput(resumeText),

      // STRUCTURED OUTPUT: LLM ko bol rahe hain ki jawab is schema wale JSON me hi do
      text: {
        format: {
          type: "json_schema",
          name: "resume_profile", // schema ka koi bhi naam
          schema: resumeProfileSchema,
          strict: true, // schema ko sakhti se follow karo
        },
      },
    });
  } catch (error) {
    // API fail hui (galat key, credits khatam, network, rate limit).
    // WHY sirf status aur message log: resume me personal info hoti hai,
    // isliye resume ka text kabhi log nahi karte.
    console.error("Resume LLM call failed:", error.status, error.message);

    // User ko provider ki andar ki details nahi dikhate, ek saaf message dete hain
    throw aiError("Resume padhne wali AI service abhi available nahi hai. Thodi der baad try karo.");
  }

  // ---------- Jawab adhura to nahi? ----------
  // Agar max_output_tokens me jawab kat jaye to JSON adhura hoga
  if (response.status === "incomplete") {
    throw aiError("AI ka jawab adhura reh gaya. Dobara try karo.");
  }

  // ---------- Text ko JSON object me badlo ----------
  // LLM jawab text ki shakl me deta hai (output_text), use JSON.parse se object banate hain
  try {
    return JSON.parse(response.output_text);
  } catch {
    throw aiError("AI ne galat format ka jawab diya. Dobara try karo.");
  }
}