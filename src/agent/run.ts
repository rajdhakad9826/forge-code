import { ConversationItem } from "../llm/types.js";
import { generate } from "../llm/generate.js";
import { execute_tools } from "./execute_tools.js";
import type { agentCallbacks } from "./types.js";

export async function runAgent(conversation: ConversationItem[], { onTextDelta, onPermissionRequest }: agentCallbacks) {
    while (true) {
        const { output, toolCalls } = await generate(conversation, onTextDelta);
        conversation.push(...output, ...toolCalls);
        if (toolCalls.length > 0) {
            const toolOutputs = await execute_tools(toolCalls, onPermissionRequest);
            conversation.push(...toolOutputs);
        } else {
            break;
        }
    }
}