import { toolRegistry } from "../tools/registry.js";
import { askForPermission } from "./permissions.js";
import type { ConversationItem, FunctionToolCall } from "../llm/types.js";

export async function execute_tools(toolCalls: FunctionToolCall[], onPermissionRequest: (toolName: string, args: any) => Promise<boolean>) {
    let toolOutputs: ConversationItem[] = [];
    for (let tool of toolCalls) {
        const args = JSON.parse(tool.arguments);
        const toolName = tool.name;

        const hasPermission = await askForPermission(toolName, args, onPermissionRequest)

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
    return toolOutputs
}