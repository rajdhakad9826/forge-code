import { client } from "./client.js";
import type { ConversationItem } from "./types.js";
import { toolRegistry } from "../tools/registry.js";
import { ResponseFunctionToolCall } from "openai/resources/responses/responses.mjs";
const MODEL = "openai/gpt-oss-120b";
// const MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

type GenerateResult = {
    type: "assistant" | "tool",
    output: ConversationItem[]
}


export async function generate(conversation: ConversationItem[]): Promise<GenerateResult> {
    let tools = [];
    for (let tool in toolRegistry) {

        let properties: Record<string, any> = {};

        if (toolRegistry[tool].parameters) {
            const parameters = toolRegistry[tool].parameters;
            parameters.forEach((parameter) => {
                properties[parameter.name] = {
                    type: parameter.type,
                    description: parameter.description
                }
            })

        }

        tools.push({
            type: "function" as const,
            name: tool,
            description: toolRegistry[tool].description,
            parameters: {
                type: "object",
                properties: properties
            },
            strict: true
        })
    }

    const stream = await client.responses.create({
        model: MODEL,
        input: conversation,
        tools: tools,
        stream: true
    })

    const finalToolCalls: Record<number, ResponseFunctionToolCall> = {}
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