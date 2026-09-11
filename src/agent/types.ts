import { FunctionToolCall } from "../llm/types.js";

export interface agentCallbacks {
    onTextDelta: (delta: string) => void,
    onPermissionRequest: (toolName: string, args: any) => Promise<boolean>,
    onError: (error: Error) => void,
    onToolStart: (tool: FunctionToolCall) => void,
    onToolEnd: () => void
}