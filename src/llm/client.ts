import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
import { resolveApiKey } from "../config/auth.js";

export function getClient() {
    const apiKey = resolveApiKey();
    if (!apiKey) {
        throw new Error(
            "No OpenRouter API key found."
        );
    }
    const client = new OpenAI({
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
    });
    return client;
}