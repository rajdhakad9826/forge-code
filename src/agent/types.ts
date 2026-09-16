import { ConversationItem, FunctionToolCall, TokenUsage } from "../llm/types.js";

export interface agentCallbacks {
    onTextDelta: (delta: string) => void,
    onConversationUpdate: (conversation: ConversationItem[]) => void,
    onPermissionRequest: (tool: FunctionToolCall) => Promise<boolean>,
    onError: (error: Error) => void,
    onToolStart: (tool: FunctionToolCall) => void,
    onToolEnd: (call_id: string) => void,
    onGenerateStart?: () => void,
    onGenerateEnd?: () => void,
    onCancelled?: () => void,
    onUsage: (usage: TokenUsage) => void,
}