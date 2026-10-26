import { getModel, setModelOverride } from "../config/llm.js";
import { getContextWindow, ModelNotFoundError } from "../config/models.js";

export async function model(model: string, ctx: { setModel: (arg0: any) => void; setModelContextWindow: (arg0: number) => void; }): Promise<string[]> {
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