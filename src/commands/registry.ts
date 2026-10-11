import { help } from "./help.js";
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
    }
}
