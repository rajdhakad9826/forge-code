import { client } from "./client.js";
import { ConversationItem, FunctionToolCall, GenerationAbortedError, TokenUsage } from "./types.js";
import { toolDefinitions } from "../tools/definitions.js";
import { getModel } from "../config/llm.js";
import OpenAI from "openai";
import { estimateConversationTokens } from "./tokens.js";

let controller: AbortController | null = null;

export function abortConnection() {
    controller?.abort();
}

export async function generate(conversation: ConversationItem[], onTextDelta: (delta: string) => void, onUsage: (usage: TokenUsage) => void): Promise<ConversationItem[]> {
    controller = new AbortController();
    try {
        const stream = await client.responses.create({
            model: getModel(),
            input: conversation,
            tools: toolDefinitions,
            stream: true,
        }, {
            signal: controller.signal
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
                    const output = [
                        ...assistantMessage,
                        ...toolCalls
                    ]
                    const inputTokens = event.response.usage?.input_tokens ?? estimateConversationTokens(conversation)
                    const outputTokens = event.response.usage?.output_tokens ?? estimateConversationTokens(output)
                    const total = event.response.usage?.total_tokens ?? inputTokens + outputTokens

                    onUsage({
                        inputTokens,
                        outputTokens,
                        total
                    })

                    return output;
            }
        }
    } catch (error) {
        if (error instanceof OpenAI.APIUserAbortError)
            throw new GenerationAbortedError();
        throw error
    }
    throw new Error("Response stream ended without a final response.");
}