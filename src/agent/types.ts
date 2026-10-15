import { ConversationItem, FunctionToolCall, TokenUsage } from "../llm/types.js";

export type ToolStatus = "running" | "awaiting_permission" | "completed" | "failed" | "denied";
export interface agentCallbacks {
    onTextDelta: (delta: string) => void,
    onConversationUpdate: (context: ConversationItem[], newOutputs: ConversationItem[]) => void,
    onPermissionRequest: (tool: FunctionToolCall) => Promise<boolean>,
    onError: (error: Error) => void,
    onToolStart: (tool: FunctionToolCall) => void,
    onToolEnd: (call_id: string, status: ToolStatus) => void,
    onGenerateStart?: () => void,
    onGenerateEnd?: () => void,
    onCancelled?: () => void,
    onUsage: (usage: TokenUsage) => void,
}