import { ConversationItem, FunctionToolCall } from "../llm/types.js";
import { generate } from "../llm/generate.js";
import { execute_tools } from "./execute_tools.js";


interface agentCallbacks {
    onTextDelta: (delta: string) => void,
    onPermissionRequest: (toolName: string, args: any) => Promise<boolean>
}

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