import { client } from "./client.js";
import type { ConversationItem } from "./types.js";
import { toolRegistry } from "../tools/registry.js";
import type { GenerateResult, FunctionToolCall } from "./types.js";
import { toolDefinitions } from "../tools/definitions.js";
import { MODEL } from "../config/llm.js";

export async function generate(conversation: ConversationItem[]): Promise<GenerateResult> {

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
                process.stdout.write(event.delta)
                break;
            case "response.output_text.done":
                process.stdout.write('\n')
                let response: GenerateResult = {
                    type: "assistant",
                    output: [{ role: "assistant", content: event.text }]
                }
                return response
            case "response.completed":
                // console.log(finalToolCalls)
                const toolCalls = Object.values(finalToolCalls);
                if (toolCalls.length > 0) {
                    let toolOutputs: ConversationItem[] = [];
                    for (let tool in finalToolCalls) {
                        const args = JSON.parse(finalToolCalls[tool].arguments);
                        const toolName = finalToolCalls[tool].name
                        const toolResult = await toolRegistry[toolName].callback(args)
                        toolOutputs.push({
                            type: "function_call_output",
                            call_id: finalToolCalls[tool].call_id,
                            output: toolResult
                        })
                    }
                    return { type: "tool", output: [...toolCalls, ...toolOutputs] };
                }
        }
    }
    throw new Error("Response stream ended without a final response.");
}