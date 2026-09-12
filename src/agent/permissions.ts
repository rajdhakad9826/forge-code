import { FunctionToolCall } from "../llm/types.js";

export async function askForPermission(tool: FunctionToolCall, onPermissionRequest: (tool: FunctionToolCall) => Promise<boolean>): Promise<boolean> {
    const toolsRequiringPermission = new Set([
        'write_file',
        'execute_shell'
    ])

    if (!toolsRequiringPermission.has(tool.name))
        return true;

    return onPermissionRequest(tool);
}
