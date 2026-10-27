import { auth } from "./auth.js";
import { help } from "./help.js";
import { model } from "./model.js";
import { quit } from "./quit.js";
import { Command } from "./types.js";

export const commandRegistry: Record<string, Command> = {
    help: {
        name: "help",
        description: "Show all available commands.",
        callback: help
    },
    quit: {
        name: "quit",
        description: "Quit Forge.",
        callback: quit
    },
    model: {
        name: "model",
        description: "Switch to another one: /model <name> [--save].",
        callback: model
    },
    auth: {
        name: "auth",
        description: "Manage authentication: /auth <login|logout|status>.",
        callback: auth
    }
}
