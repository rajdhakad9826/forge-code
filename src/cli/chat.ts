import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import type { ConversationItem } from "../llm/types.js";
import { runAgent } from "../agent/run.js";

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
        await runAgent(conversation);
    }

    while (true) {
        const prompt = await rl.question("❯ ")
        conversation.push({ "role": "user", content: prompt })
        await runAgent(conversation)
    }
}
