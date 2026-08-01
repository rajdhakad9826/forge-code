#!/usr/bin/env node
import { Command } from "commander";
import { startChat } from "./chat.js";
const program = new Command();

program
    .name('forge-code')
    .description('Forge is a CLI tool for AI-assisted code generation')
    .version('1.0.0');

program
    .command('chat')
    .description('Send a prompt to the AI and print the response')
    .argument('[prompt]')
    .action(async (prompt) => startChat(prompt));

export default program;