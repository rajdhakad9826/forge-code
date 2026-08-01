#!/usr/bin/env node
import { Command } from "commander";
import { chat } from "../llm/chat.js";

const program = new Command();

program
    .name('forge-code')
    .description('Forge is a CLI tool for AI-assisted code generation')
    .version('1.0.0');

program
    .command('chat <prompt>')
    .description('Send a prompt to the AI and print the response')
    .action(async (prompt) => {
        const response = await chat(prompt);
        console.log(response)
    });

export default program;