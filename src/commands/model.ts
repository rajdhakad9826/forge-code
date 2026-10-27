import { getModel, saveModelToConfig, setModelOverride } from "../config/llm.js";
import { getContextWindow, ModelNotFoundError } from "../config/models.js";
import { CommandContext } from "./types.js";

export async function model(args: string, ctx: CommandContext): Promise<string[]> {
    const parts = args.trim().split(/\s+/);
    const saveFlag = parts.includes("--save");
    const modelName = parts.filter(p => p !== "--save").join(" ");

    if (!modelName) return [`Current model: ${getModel()}`];

    try {
        const contextWindow = await getContextWindow(modelName);
        setModelOverride(modelName);
        ctx.setModel(modelName);
        ctx.setModelContextWindow(contextWindow);

        if (saveFlag) {
            saveModelToConfig(modelName);
            return [`Switched to ${modelName} (saved to config)`];
        }

        return [`Switched to ${modelName}`];
    } catch (error) {
        if (error instanceof ModelNotFoundError) return [`Model '${modelName}' not found`];
        return [`Could not switch model: ${error instanceof Error ? error.message : error}`];
    }
}