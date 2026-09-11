import { ConversationItem, FunctionToolCall } from "../llm/types.js";

export interface agentCallbacks {
    onTextDelta: (delta: string) => void,
    onConversationUpdate: (conversation: ConversationItem[]) => void,
    onPermissionRequest: (toolName: string, args: any) => Promise<boolean>,
    onError: (error: Error) => void,
    onToolStart: (tool: FunctionToolCall) => void,
    onToolEnd: (call_id: string) => void
}