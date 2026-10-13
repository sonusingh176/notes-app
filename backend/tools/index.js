import countApplications from "./countApplications.tool.js";


// WHAT: saare available tools ki list.
// WHY: naya tool jodna ho to yahan sirf ek import + list me ek entry. Baaki code nahi chhedna.
const tools = [countApplications];

// WHAT: sirf definitions ki list (LLM ke liye).
// WHY: openai.responses.create({ tools }) me yahi bhejni hoti hai. LLM ko function ka
//      code nahi dikhta, sirf ye description card dikhta hai.
// LLM ko bhejne ke liye definitions
export const toolDefinitions = tools.map((t) => t.definition);


// WHAT: { "count_application": handlerFunction } jaisa map banata hai.
// WHY: LLM sirf tool ka NAAM bhejta hai ("count_application"). Naam se seedha function
//      dhundne ke liye ye map hai, isse if/else ki lambi chain nahi likhni padti.
// WHY definition.name se: naam haath se likhte to typo se map aur definition alag ho jaate.

// tool ka naam -> uska handler (key definition.name se aati hai, haath se nahi likhni)
export const toolHandlers = Object.fromEntries(
  tools.map((t) => [t.definition.name, t.handler])
);