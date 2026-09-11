import { ConversationItem, FunctionToolCall } from "../llm/types.js";
import { generate } from "../llm/generate.js";
import { execute_tools } from "./execute_tools.js";
import type { agentCallbacks } from "./types.js";

export async function runAgent(conversation: ConversationItem[], { onTextDelta, onPermissionRequest, onError, onToolStart, onToolEnd }: agentCallbacks) {
    try {
        while (true) {
            const output = await generate(conversation, onTextDelta);
            const toolCalls = output.filter(
                (item): item is FunctionToolCall =>
                    item.type === "function_call"
            );
            if (toolCalls.length > 0) {
                const toolOutputs = await execute_tools(toolCalls, onPermissionRequest, onToolStart, onToolEnd);
                conversation.push(...output, ...toolOutputs);
            } else {
                conversation.push(...output);
                break;
            }
        }
    } catch (error) {
        onError(error instanceof Error ? error : new Error(String(error)));
    }

}