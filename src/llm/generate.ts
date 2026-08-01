import OpenAI from "openai";
import { client } from "./client.js";
import type { Message } from "./types.js";
const MODEL = "openai/gpt-oss-120b";

export async function generate(conversation: Message[]) {
    process.stdout.write("Thinking...\n");
    const stream = await client.responses.create({
        model: MODEL,
        input: conversation,
        stream: true
    })

    for await (const event of stream) {
        if (event.type === "response.output_text.delta")
            process.stdout.write(event.delta)
        else if (event.type === "response.output_text.done") {
            process.stdout.write('\n')
            return event.text
        }
    }
}