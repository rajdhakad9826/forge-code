import { toolDefinitions } from "../tools/definitions.js";
import { ConversationItem } from "./types.js";

const TOOL_DEFINITIONS_OVERHEAD = estimateTokens(JSON.stringify(toolDefinitions));

export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

export function estimateConversationTokens(conversation: ConversationItem[]): number {
    let text = "";
    for (let conversationItem of conversation)
        text += JSON.stringify(conversationItem);
    return estimateTokens(text) + TOOL_DEFINITIONS_OVERHEAD;
}