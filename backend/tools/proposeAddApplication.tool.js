import PendingAction from "../models/PendingAction.js";

const WORK_MODES = ["remote", "onsite", "hybrid"];

// string ko safe tarike se saaf karo (LLM ke args par bharosa nahi)
const clean = (v) => (typeof v === "string" ? v.trim() : "");

// WHAT: naya application "propose" karta hai. DB me JobApplication NAHI banata.
// WHY userId alag parameter: pehle ki tarah, JWT se aati hai, LLM ke args se kabhi nahi.
export async function proposeAddApplication(userId, args = {}) {
  const companyName = clean(args.companyName);
  const role = clean(args.role);
  const location = clean(args.location);

  // WHY server par validation: LLM galat ya adhura data bhej sakta hai.
  // Model me required fields: companyName, role, location
  const missing = [];
  if (!companyName) missing.push("companyName");
  if (!role) missing.push("role");
  if (!location) missing.push("location");
  if (missing.length) {
    // WHY error wapas: LLM user se poochh lega, andaze se bharega nahi
    return { saved: false, error: `Missing: ${missing.join(", ")}. Ask the user, do not guess.` };
  }

  // WHY length limit: bahut lamba text DB me ghusane se rokna
  if ([companyName, role, location].some((v) => v.length > 100)) {
    return { saved: false, error: "Company, role or location is too long (max 100 characters)." };
  }

  // WHY allowlist: workMode sirf model ke enum wali values hi ho sakti hain
  const workMode = args.workMode || "onsite";
  if (!WORK_MODES.includes(workMode)) {
    return { saved: false, error: `workMode must be one of: ${WORK_MODES.join(", ")}` };
  }

  // date nahi di to aaj ki; galat date ho to error
  const appliedDate = args.appliedDate ? new Date(args.appliedDate) : new Date();
  if (isNaN(appliedDate.getTime())) {
    return { saved: false, error: "appliedDate is not a valid date (use YYYY-MM-DD)." };
  }

  const payload = { companyName, role, location, workMode, appliedDate };

  // WHAT: proposal parking area me rakho, 10 minute ki expiry ke saath
  const pending = await PendingAction.create({
    user: userId,
    type: "add_application",
    payload,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  return {
    saved: false, // WHY: LLM ko saaf pata chale ki abhi kuch save nahi hua
    pendingActionId: pending._id,
    preview: payload,
    message: "NOT saved yet. Tell the user to review this preview and press Confirm.",
  };
}

// WHAT: LLM ko dikhne wala description card
export const proposeAddApplicationTool = {
  type: "function",
  name: "propose_add_application",
  description:
    "Prepare a NEW job application for the user to review. This does NOT save anything; " +
    "the user must confirm separately. Use it when the user says they applied to a job and " +
    "want it added. Use only details the user actually gave. If company, role or location " +
    "is missing, ask the user instead of guessing.",
  strict: true,
  parameters: {
    type: "object",
    properties: {
      companyName: { type: "string", description: "Company name" },
      role: { type: "string", description: "Job title, e.g. Backend Developer" },
      location: { type: ["string", "null"], description: "Job location. null if the user did not say." },
      workMode: {
        type: ["string", "null"],
        enum: ["remote", "onsite", "hybrid", null],
        description: "null if the user did not say.",
      },
      appliedDate: {
        type: ["string", "null"],
        description: "YYYY-MM-DD. null means today.",
      },
    },
    // strict mode me saari fields required hoti hain, "pata nahi" ke liye null
    required: ["companyName", "role", "location", "workMode", "appliedDate"],
    additionalProperties: false,
  },
};

export default {
  definition: proposeAddApplicationTool,
  handler: proposeAddApplication,
};