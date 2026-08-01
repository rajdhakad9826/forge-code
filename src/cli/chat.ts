import OpenAI from "openai";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { chat } from "../llm/chat.js";

const SYSTEM_PROMPT = "You are a helpful assistant.";


export async function startChat(initialPrompt: string) {

    const conversation: OpenAI.Responses.ResponseInput = [
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
        const assistantMessage = await chat(conversation);
        if (typeof assistantMessage === "string")
            conversation.push({ role: "assistant", content: assistantMessage })

    }

    while (true) {
        const prompt = await rl.question("❯ ")
        conversation.push({ "role": "user", content: prompt })
        const assistantMessage = await chat(conversation);
        if (typeof assistantMessage === "string")
            conversation.push({ role: "assistant", content: assistantMessage })
    }
}
