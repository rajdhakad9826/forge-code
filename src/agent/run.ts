import { ConversationItem } from "../llm/types.js";
import { generate } from "../llm/generate.js";

export async function runAgent(conversation: ConversationItem[]) {
    console.log("Thinking...")
    while (true) {
        const assistantMessage = await generate(conversation);
        conversation.push(...assistantMessage.output);
        if (assistantMessage.type === "assistant")
            break;
    }
}