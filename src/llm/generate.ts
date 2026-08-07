import { client } from "./client.js";
import type { ConversationItem } from "./types.js";
import type { GenerateResult, FunctionToolCall } from "./types.js";
import { toolDefinitions } from "../tools/definitions.js";
import { MODEL } from "../config/llm.js";

export async function generate(conversation: ConversationItem[], onTextDelta: (delta: string) => void): Promise<GenerateResult> {

    const stream = await client.responses.create({
        model: MODEL,
        input: conversation,
        tools: toolDefinitions,
        stream: true
    })

    const finalToolCalls: Record<number, FunctionToolCall> = {}
    for await (const event of stream) {
        // console.log(event)
        switch (event.type) {
            case "response.output_item.added":
                if (event.item.type === "function_call")
                    finalToolCalls[event.output_index] = event.item;
                break;
            case "response.function_call_arguments.delta":
                const index = event.output_index;
                if (finalToolCalls[index]) {
                    finalToolCalls[index].arguments += event.delta;
                };
                break;
            case "response.output_text.delta":
                onTextDelta(event.delta)
                break;
            case "response.output_text.done":
                onTextDelta('\n')
                let response: GenerateResult = {
                    type: "assistant",
                    output: [{ role: "assistant", content: event.text }]
                }
                return response
            case "response.completed":
                const toolCalls = Object.values(finalToolCalls);
                return { type: "tool", output: toolCalls }
        }
    }
    throw new Error("Response stream ended without a final response.");
}