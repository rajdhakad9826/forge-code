import OpenAI from "openai";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { generate } from "../llm/generate.js";
import type { ConversationItem } from "../llm/types.js";

const SYSTEM_PROMPT = "You are a helpful assistant.";


export async function startChat(initialPrompt: string) {

    const conversation: ConversationItem[] = [
        { role: "system" as const, content: SYSTEM_PROMPT },
    ]

    const rl = createInterface({
        input: stdin,
        output: stdout
    });

    rl.on("close", () => {
        console.log("\nGoodbye!");
        process.exit(0);
    })

    console.log("\n\n\n--------------------------")
    console.log("Welcome to Forge Code!")
    console.log("--------------------------\n\n")

    if (initialPrompt) {
        conversation.push({ "role": "user", content: initialPrompt })
        console.log("Thinking...")
        while (true) {
            const assistantMessage = await generate(conversation);
            conversation.push(...assistantMessage.output);
            // console.log(conversation)
            if (assistantMessage.type === "assistant")
                break;
        }
    }

    while (true) {
        const prompt = await rl.question("❯ ")
        conversation.push({ "role": "user", content: prompt })
        console.log("Thinking...")
        while (true) {
            const assistantMessage = await generate(conversation);
            conversation.push(...assistantMessage.output);
            // console.log(conversation)
            if (assistantMessage.type === "assistant")
                break;
        }
    }
}
