import { estimateConversationTokens } from "./tokens.js";
import { ConversationItem } from "./types.js";

export function shouldCompact(conversation: ConversationItem[], contextWindow: number): boolean {
    if (contextWindow == 0)
        return false;
    const triggerPercent = 80;
    const conversationTokens = estimateConversationTokens(conversation);
    if (conversationTokens > contextWindow * triggerPercent / 100)
        return true;
    return false;
}