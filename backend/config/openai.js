import OpenAI from "openai";

// Create one OpenAI client.
// The SDK automatically uses OPENAI_API_KEY from process.env.

//creates a client that our backend will use to communicate with OpenAI.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
   
});

export default openai;