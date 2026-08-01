import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { chat } from "../llm/chat.js";

export async function startChat(initialPrompt: string) {

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

    if (initialPrompt)
        await chat(initialPrompt);

    while (true) {
        const prompt = await rl.question("❯ ")
        await chat(prompt)
    }
}
