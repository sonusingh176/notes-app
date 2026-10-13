import JobApplication from "../models/JobApplication.js";

// WHAT: user ki sabse nayi applications ki details laata hai (company, role, status, date).
// WHY: count tool sirf ginti deta hai. "Last applied job kaunsi thi?" jaise sawal ko details chahiye.
// userId pehle ki tarah controller se aati hai, LLM ke args se kabhi nahi.
export async function getRecentApplications(userId, { limit, status } = {}) {
  const filter = { user: userId }; // sirf isi user ka data
  if (status) filter.currentStatus = status;

  const jobs = await JobApplication.find(filter)
    // sabse naya pehle; same din ki 2 applications ho to createdAt se tie-break
    .sort({ appliedDate: -1, createdAt: -1 })
    // default 1, max 10: LLM bahut bada number bheje to bhi limit rahe
    .limit(Math.min(limit || 1, 10))
    // sirf kaam ki fields, baaki (notes, id, etc.) LLM ko nahi bhejni
    .select("companyName role location workMode currentStatus appliedDate -_id")
    .lean();

  return { count: jobs.length, applications: jobs };
}

// WHAT: LLM ko dikhne wala "description card".
// WHY description important: LLM isi se decide karta hai ki ye tool kab chalana hai.
export const getRecentApplicationsTool = {
  type: "function",
  name: "get_recent_applications",
  description:
    "Get the details (company, role, status, applied date) of the user's most recent " +
    "job applications. Use this when the user asks about their last/latest/recent applied job.",
  strict: true,
  parameters: {
    type: "object",
    properties: {
      limit: {
        type: ["integer", "null"],
        description: "How many recent applications to return (1 to 10). Use 1 for 'last applied job'.",
      },
      status: {
        type: ["string", "null"],
        enum: [
          "applied", "interview_scheduled", "interview_completed",
          "offered", "rejected", "withdrawn", null,
        ],
        description: "Only return applications with this status, or null for all.",
      },
    },
    required: ["limit", "status"], // strict mode me saari fields required hoti hain, "kuch nahi" ke liye null
    additionalProperties: false,
  },
};

export default {
  definition: getRecentApplicationsTool,
  handler: getRecentApplications,
};