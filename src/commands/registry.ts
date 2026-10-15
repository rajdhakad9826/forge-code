import { getModel, setModelOverride } from "../config/llm.js";
import { getContextWindow, ModelNotFoundError } from "../config/models.js";
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
    },
    model: {
        name: "model",
        description: "Switch to another one: /model <name>.",
        callback: async (model, ctx): Promise<string[]> => {
            if (!model) return [`Current model: ${getModel()}`];
            try {
                const contextWindow = await getContextWindow(model);
                setModelOverride(model);
                ctx.setModel(model);
                ctx.setModelContextWindow(contextWindow);
                return [`Switched to ${model}`];
            } catch (error) {
                if (error instanceof ModelNotFoundError) return [`Model '${model}' not found`];
                return [`Could not switch model: ${error instanceof Error ? error.message : error}`];
            }
        }
    }
}
