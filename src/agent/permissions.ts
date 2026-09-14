import { FunctionToolCall } from "../llm/types.js";
import { toolRegistry } from "../tools/registry.js";

export async function askForPermission(tool: FunctionToolCall, onPermissionRequest: (tool: FunctionToolCall) => Promise<boolean>): Promise<boolean> {

    if (toolRegistry[tool.name].requiresPermission)
        return onPermissionRequest(tool);

    return true;
}
