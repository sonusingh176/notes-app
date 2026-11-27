// ============================================================
// RESUME PROFILE SCHEMA
// ============================================================
// WHAT: Ye ek "JSON Schema" hai. Isme hum LLM ko batate hain ki uska jawab
//       kis shape ka JSON hona chahiye (kaunsi fields, kaunsa type).
//
// WHY:  Schema na dein to LLM kabhi "fullName" likhega, kabhi "name",
//       kabhi extra fields bhi bhej dega. Schema dene se har baar
//       ek jaisa JSON milta hai, jise hum seedha form me bhar sakte hain.
//
// Ye file sirf schema rakhti hai. LLM ko call karne ka code agle step me aayega.
//
// 3 RULES jo is file me har object par lage hain (OpenAI "strict" mode ke rules):
//   1. Har field "required" list me honi chahiye.
//   2. "additionalProperties: false" -> LLM apni taraf se extra field nahi jod sakta.
//   3. Agar koi value optional hai to use hata nahi sakte. Uska type
//      ["string", "null"] rakhte hain, matlab "text ho sakta hai, ya null".
//      Resume me jo cheez na mile wahan LLM null bhejega (andaza nahi lagayega).
//
// NOTE: "description" LLM ke liye instruction ki tarah kaam karta hai.
//       LLM inhe padhkar samajhta hai ki kis field me kya daalna hai.
//       (Descriptions English me hain kyunki LLM ko wahi behtar samajh aata hai.)
// ============================================================

export const resumeProfileSchema = {
  // Sabse bahar ka JSON ek object hai: { ... }
  type: "object",

  // "properties" = is object ke andar kaun kaunsi fields hongi
  properties: {
    // ---------- Basic details (sab single text values) ----------
    // ["string", "null"] = text ya null. Resume me na mile to null.
    fullName: {
      type: ["string", "null"],
      description: "Full name of the candidate, exactly as written in the resume.",
    },
    phone: {
      type: ["string", "null"],
      description: "Phone number as written in the resume. null if not present.",
    },
    location: {
      type: ["string", "null"],
      description: "Current city and country, e.g. 'Indore, India'. null if not present.",
    },
    headline: {
      type: ["string", "null"],
      description: "Professional title shown at the top of the resume, e.g. 'Full-stack developer'. null if not present.",
    },
    summary: {
      type: ["string", "null"],
      // "Do not write a new one" important hai: warna LLM khud summary bana dega
      description: "The summary or objective paragraph written in the resume. Do NOT write a new one. null if the resume has none.",
    },

    // ---------- Links (ek chhota object, uske andar 3 fields) ----------
    // Nested object ke liye bhi wahi rules: required + additionalProperties false
    links: {
      type: "object",
      properties: {
        linkedin: { type: ["string", "null"], description: "Full LinkedIn profile URL starting with http. null if not present." },
        github: { type: ["string", "null"], description: "Full GitHub profile URL starting with http. null if not present." },
        portfolio: { type: ["string", "null"], description: "Personal website or portfolio URL starting with http. null if not present." },
      },
      required: ["linkedin", "github", "portfolio"],
      additionalProperties: false,
    },

    // ---------- Skills (text ki list) ----------
    // List ho to khaali [] aayega, null nahi
    skills: {
      type: "array",
      items: { type: "string" }, // list ka har item ek text hai
      description: "Technical skills listed in the resume, one per item, e.g. 'Node.js', 'MongoDB'. No duplicates. Empty array if none.",
    },

    // ---------- Experience (objects ki list) ----------
    // Har job ek object hai, isliye "items" me poora object ka schema likha hai
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          // company hamesha chahiye, isliye yahan null allowed nahi (type sirf "string")
          company: { type: "string", description: "Company name." },
          role: { type: ["string", "null"], description: "Job title at this company. null if not present." },
          startDate: {
            type: ["string", "null"],
            description: "Start month in YYYY-MM format, e.g. '2022-03'. null if the month is not clearly written (for example only the year is given).",
          },
          endDate: {
            type: ["string", "null"],
            description: "End month in YYYY-MM format. null if the person still works here, or if the month is not clearly written.",
          },
          isCurrent: {
            type: "boolean",
            description: "true only if the resume says Present, Current or Ongoing for this job. Otherwise false.",
          },
          technologies: {
            type: "array",
            items: { type: "string" },
            description: "Technologies mentioned for THIS job only. Empty array if none.",
          },
          description: {
            type: ["string", "null"],
            description: "Short description of the work done in this job, taken from the resume. null if not present.",
          },
        },
        required: ["company", "role", "startDate", "endDate", "isCurrent", "technologies", "description"],
        additionalProperties: false,
      },
      description: "All jobs in the resume, latest first. Empty array if none.",
    },

    // ---------- Education (objects ki list) ----------
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          institution: { type: "string", description: "School, college or university name." },
          degree: { type: ["string", "null"], description: "Degree name, e.g. 'B.Tech'. null if not present." },
          fieldOfStudy: { type: ["string", "null"], description: "Branch or subject, e.g. 'Computer Science'. null if not present." },
          // years numbers hain (text nahi), isliye "integer"
          startYear: { type: ["integer", "null"], description: "Four digit start year, e.g. 2017. null if not present." },
          endYear: { type: ["integer", "null"], description: "Four digit end year, e.g. 2021. null if not present." },
        },
        required: ["institution", "degree", "fieldOfStudy", "startYear", "endYear"],
        additionalProperties: false,
      },
      description: "All education entries in the resume. Empty array if none.",
    },
  },

  // Sabse bahar wale object ki saari fields required hain (rule 1)
  required: ["fullName", "phone", "location", "headline", "summary", "links", "skills", "experience", "education"],

  // LLM extra field nahi jod sakta (rule 2)
  additionalProperties: false,
};