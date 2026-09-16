import { ConversationItem } from "./types.js";

export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

export function estimateConversationTokens(conversation: ConversationItem[]): number {
    let text = "";
    for (let conversationItem of conversation)
        text += JSON.stringify(conversationItem);

    return estimateTokens(text);
}