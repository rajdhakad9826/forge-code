import { estimateConversationTokens } from "./tokens.js";
import { ConversationItem } from "./types.js";
import { writeFileSync } from "fs";

export function shouldCompact(conversation: ConversationItem[], contextWindow: number): boolean {
    if (contextWindow == 0)
        return false;
    const triggerPercent = 80;
    const conversationTokens = estimateConversationTokens(conversation);
    if (conversationTokens > contextWindow * triggerPercent / 100)
        return true;
    return false;
}

export async function compactConversation(conversation: ConversationItem[], contextWindow: number): Promise<ConversationItem[]> {
    const newConversation: ConversationItem[] = [];
    newConversation.push(conversation[0]);
    const turns: any = [];
    let turnIdx = -1;
    for (let i = 1; i < conversation.length; i++) {
        const item = conversation[i];
        if ('role' in item && item.role === "user") {
            turnIdx++;
            turns[turnIdx] = [];
        }
        if (turnIdx >= 0) {
            turns[turnIdx].push(item);
        }
    }

    let i = turns.length - 1;
    const turnsToKeep: any = []
    const collectedConversation = [...newConversation]
    while (estimateConversationTokens(collectedConversation) < 0.5 * contextWindow && i >= 0) {
        collectedConversation.push(...turns[i]);
        turnsToKeep.push(turns[i]);
        i--;
    }

    const droppedTurns: any = [];
    while (i >= 0) {
        droppedTurns.push(turns[i])
        i--;
    }

    const droppedConversation: ConversationItem[] = [];
    for (let i = droppedTurns.length - 1; i >= 0; i--)
        droppedConversation.push(...droppedTurns[i])


    for (let i = turnsToKeep.length - 1; i >= 0; i--)
        newConversation.push(...turnsToKeep[i]);

    return newConversation;
}