import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

export const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});


