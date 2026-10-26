import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
import { resolveApiKey } from "../config/auth.js";

export const client = new OpenAI({
    apiKey: resolveApiKey(),
    baseURL: "https://openrouter.ai/api/v1",
});


