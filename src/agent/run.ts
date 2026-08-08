import { ConversationItem, FunctionToolCall } from "../llm/types.js";
import { generate } from "../llm/generate.js";
import { toolRegistry } from "../tools/registry.js";
import { askForPermission } from "./permissions.js";

export async function runAgent(
    conversation: ConversationItem[],
    onTextDelta?: (delta: string) => void,
    onPermissionRequest?: (toolName: string, args: any) => Promise<boolean>
) {
    const textDeltaCallback = onTextDelta || ((delta: string) => { process.stdout.write(delta) });
    while (true) {
        const assistantMessage = await generate(conversation, textDeltaCallback);
        conversation.push(...assistantMessage.output);
        if (assistantMessage.type === "assistant")
            break;
        const toolCalls = assistantMessage.output
        if (toolCalls.length > 0) {
            let toolOutputs: ConversationItem[] = [];
            for (let tool of toolCalls) {
                const args = JSON.parse(tool.arguments);
                const toolName = tool.name;

                const hasPermission = onPermissionRequest
                    ? await onPermissionRequest(toolName, args)
                    : await askForPermission(toolName, args);

                if (!hasPermission) {
                    toolOutputs.push({
                        type: "function_call_output",
                        call_id: tool.call_id,
                        output: "User denied permission to execute this tool. Tell the user what you need to do differently."
                    });
                    continue;
                }

                const toolResult = await toolRegistry[toolName].callback(args);
                toolOutputs.push({
                    type: "function_call_output",
                    call_id: tool.call_id,
                    output: toolResult
                });
            }
            conversation.push(...toolOutputs);
        }
        // console.log(conversation)
    }
}