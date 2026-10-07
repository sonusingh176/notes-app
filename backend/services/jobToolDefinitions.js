import JobApplication from "../models/JobApplication.js";

/*
|--------------------------------------------------------------------------
| DATABASE TOOL
|--------------------------------------------------------------------------
|
| This is the REAL function that talks to MongoDB.
|
| Very important:
|
| userId comes from req.user._id
|
| The AI will NEVER provide the userId.
|
| This prevents one user from asking the AI to access another
| user's job applications.
|
|--------------------------------------------------------------------------
*/

export async function countApplications(userId,{ fromDate, toDate, status } = {}) {

    // Start with the most important security filter.
    // Only this logged-in user's applications can be counted.
    const filter = {
        user: userId
    };

    /*
    |--------------------------------------------------------------------------
    | DATE FILTER
    |--------------------------------------------------------------------------
    |
    | Example:
    |
    | fromDate = "2026-10-01"
    | toDate   = "2026-10-07"
    |
    | MongoDB will return applications between these dates.
    |
    |--------------------------------------------------------------------------
    */

    if (fromDate || toDate) {

        filter.appliedDate = {};

        // Start date
        if (fromDate) {
            filter.appliedDate.$gte = new Date(`${fromDate}T00:00:00.000Z`);
        }

        // End date
        if (toDate) {
            filter.appliedDate.$lte = new Date(`${toDate}T23:59:59.999Z`);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | STATUS FILTER
    |--------------------------------------------------------------------------
    |
    | Example:
    |
    | "How many applications were rejected?"
    |
    | AI can send:
    |
    | status = "rejected"
    |
    |--------------------------------------------------------------------------
    */

    if (status) {
        filter.currentStatus = status;
    }

    // Ask MongoDB for the number of matching applications.
    const count = await JobApplication.countDocuments(filter);

    // Return structured data.
    return {
        count,
        fromDate: fromDate || null,
        toDate: toDate || null,
        status: status || null
    };
}


/*
|--------------------------------------------------------------------------
| OPENAI TOOL DEFINITION
|--------------------------------------------------------------------------
|
| This is NOT the database function.
|
| This is a DESCRIPTION given to the AI.
|
| It tells the AI:
|
| "You have a tool called count_application."
|
| The AI can decide when this tool should be used.
|
|--------------------------------------------------------------------------
*/

export const countApplicationTool = {

    // OpenAI identifies the tool using this name.
    type: "function",

    name: "count_application",

    /*
    |--------------------------------------------------------------------------
    | DESCRIPTION
    |--------------------------------------------------------------------------
    |
    | The AI reads this description and decides whether this tool
    | is useful for the user's question.
    |
    |--------------------------------------------------------------------------
    */

    description:
        "Count the logged-in user's job applications. " +
        "Use this when the user asks how many jobs they applied for, " +
        "how many applications they have in a date range, " +
        "or how many applications have a specific status.",

    /*
    |--------------------------------------------------------------------------
    | STRICT MODE
    |--------------------------------------------------------------------------
    |
    | strict: true tells the model to follow this schema exactly.
    |
    |--------------------------------------------------------------------------
    */

    strict: true,

    parameters: {

        type: "object",

        properties: {

            fromDate: {
                type: ["string", "null"],
                description:
                    "Start date in YYYY-MM-DD format. " +
                    "Use null when there is no start date."
            },

            toDate: {
                type: ["string", "null"],
                description:
                    "End date in YYYY-MM-DD format. " +
                    "Use null when there is no end date."
            },

            status: {
                type: ["string", "null"],
                enum: [
                    "applied",
                    "interview_scheduled",
                    "interview_completed",
                    "offered",
                    "rejected",
                    "withdrawn",
                    null
                ],
                description:
                    "Application status to filter by. " +
                    "Use null when status is not specified."
            }
        },

        // Because strict mode is enabled, all properties are required.
        required: [
            "fromDate",
            "toDate",
            "status"
        ],

        // Prevent the AI from sending unexpected properties.
        additionalProperties: false
    }
};