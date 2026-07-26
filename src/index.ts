import { chat } from "./llm/chat.js";

async function main() {
    const prompt = "Hello!";
    const response = await chat(prompt);
    console.log(response);
}
main();