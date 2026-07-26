import { client } from "./client.js";

const SYSTEM_PROMPT = "You are a helpful assistant.";
const MODEL = "openai/gpt-oss-120b";

export async function chat(prompt: string) {
    const chatCompletion = await client.chat.completions.create({
        model: MODEL,
        messages: [
            {
                role: "system",
                content: SYSTEM_PROMPT,
            },
            {
                role: "user",
                content: prompt,
            },
        ],
    })
    return chatCompletion.choices[0].message.content;
}