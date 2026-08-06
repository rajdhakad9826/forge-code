import { ConversationItem, FunctionToolCall } from "../llm/types.js";
import { generate } from "../llm/generate.js";
import { toolRegistry } from "../tools/registry.js";

export async function runAgent(conversation: ConversationItem[]) {
    console.log("Thinking...")
    while (true) {
        const assistantMessage = await generate(conversation);
        conversation.push(...assistantMessage.output);
        if (assistantMessage.type === "assistant")
            break;
        const toolCalls = assistantMessage.output
        if (toolCalls.length > 0) {
            let toolOutputs: ConversationItem[] = [];
            for (let tool of toolCalls) {
                const args = JSON.parse(tool.arguments);
                const toolName = tool.name
                const toolResult = await toolRegistry[toolName].callback(args)
                toolOutputs.push({
                    type: "function_call_output",
                    call_id: tool.call_id,
                    output: toolResult
                })
            }
            conversation.push(...toolOutputs);
        }
        console.log(conversation)
    }
}