import { getModel } from "../config/llm.js"
import { client } from "./client.js"
import { ConversationItem } from "./types.js"

export async function complete(prompt: string, systemPrompt: string = "You are a precise assistant. Respond only with the requested output — no preamble, no explanation, no formatting unless asked.") {
    const messages: ConversationItem[] = [
        {
            "role": "system",
            "content": systemPrompt
        },
        {
            "role": "user",
            "content": prompt
        }
    ]
    const response = await client.responses.create({
        model: getModel(),
        input: messages,
    })

    return response.output_text;
}

