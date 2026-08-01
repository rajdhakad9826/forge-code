import OpenAI from "openai";
import { client } from "./client.js";
const SYSTEM_PROMPT = "You are a helpful assistant.";
const MODEL = "openai/gpt-oss-120b";

export async function chat(prompt: string) {

    const context: OpenAI.Responses.ResponseInput = [
        { role: "system" as const, content: SYSTEM_PROMPT },
        { role: "user" as const, content: prompt }
    ]

    process.stdout.write("Thinking...\n");

    const stream = await client.responses.create({
        model: MODEL,
        input: context,
        stream: true
    })

    for await (const event of stream) {
        if (event.type === "response.output_text.delta")
            process.stdout.write(event.delta)
        else if (event.type === "response.completed")
            process.stdout.write('\n')
    }
}