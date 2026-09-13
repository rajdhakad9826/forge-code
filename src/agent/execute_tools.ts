import { toolRegistry } from "../tools/registry.js";
import { askForPermission } from "./permissions.js";
import type { ConversationItem, FunctionToolCall } from "../llm/types.js";

export async function execute_tools(toolCalls: FunctionToolCall[], onPermissionRequest: (tool: FunctionToolCall) => Promise<boolean>, onToolStart: (tool: FunctionToolCall) => void, onToolEnd: (call_id: string) => void) {
    let toolOutputs: ConversationItem[] = [];
    for (let tool of toolCalls) {
        let started = false;
        try {
            const args = JSON.parse(tool.arguments);
            const toolName = tool.name;

            onToolStart(tool)
            started = true;

            const hasPermission = await askForPermission(tool, onPermissionRequest)

            if (!hasPermission) {
                toolOutputs.push({
                    type: "function_call_output",
                    call_id: tool.call_id,
                    output: "User denied permission to execute this tool. Tell the user what you need to do differently."
                });
                continue;
            }
            if (!toolRegistry[toolName])
                throw new Error(`Tool "${toolName}" does not exist.`);

            const toolResult = await toolRegistry[toolName].callback(args);

            toolOutputs.push({
                type: "function_call_output",
                call_id: tool.call_id,
                output: toolResult
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            toolOutputs.push({
                type: "function_call_output",
                call_id: tool.call_id,
                output: message
            })
        } finally {
            if (started) {
                onToolEnd(tool.call_id);
            }
        }
    }
    return toolOutputs
}