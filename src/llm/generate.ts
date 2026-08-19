import { client } from "./client.js";
import type { ConversationItem, FunctionToolCall } from "./types.js";
import { toolDefinitions } from "../tools/definitions.js";
import { MODEL } from "../config/llm.js";

export async function generate(conversation: ConversationItem[], onTextDelta: (delta: string) => void): Promise<ConversationItem[]> {

    const stream = await client.responses.create({
        model: MODEL,
        input: conversation,
        tools: toolDefinitions,
        stream: true
    })

    const finalToolCalls: Record<number, FunctionToolCall> = {}
    const assistantMessage: ConversationItem[] = [];
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
                assistantMessage.push({ role: "assistant", content: event.text })
                break;
            case "response.failed":
                throw new Error(event.response?.error?.message ?? "LLM request failed.");
            case "response.completed":
                const toolCalls = Object.values(finalToolCalls);
                return [
                    ...assistantMessage,
                    ...toolCalls
                ]
        }
    }
    throw new Error("Response stream ended without a final response.");
}