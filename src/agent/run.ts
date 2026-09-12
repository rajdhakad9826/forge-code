import { ConversationItem, FunctionToolCall } from "../llm/types.js";
import { generate } from "../llm/generate.js";
import { execute_tools } from "./execute_tools.js";
import type { agentCallbacks } from "./types.js";

export async function runAgent(conversation: ConversationItem[], { onTextDelta, onConversationUpdate, onPermissionRequest, onError, onToolStart, onToolEnd, onGenerateStart, onGenerateEnd }: agentCallbacks) {
    try {
        const agentConversation: ConversationItem[] = [...conversation];
        while (true) {
            onGenerateStart?.();
            const output = await generate(agentConversation, onTextDelta);
            onGenerateEnd?.();
            const toolCalls = output.filter(
                (item): item is FunctionToolCall =>
                    item.type === "function_call"
            );
            if (toolCalls.length > 0) {
                const toolOutputs = await execute_tools(toolCalls, onPermissionRequest, onToolStart, onToolEnd);
                agentConversation.push(...output, ...toolOutputs);
                onConversationUpdate(agentConversation)
            } else {
                agentConversation.push(...output);
                onConversationUpdate(agentConversation)
                break;
            }
        }
    } catch (error) {
        onError(error instanceof Error ? error : new Error(String(error)));
    }

}