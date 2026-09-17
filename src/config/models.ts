const contextWindowCache = new Map<string, number>();

const DEFAULT_CONTEXT_WINDOW = 8000;

export async function getContextWindow(model: string): Promise<number> {
    if (contextWindowCache.has(model))
        return contextWindowCache.get(model)!;

    try {
        const response = await fetch(`https://openrouter.ai/api/v1/model/${model}`);
        const json = await response.json();
        const contextLength = json.data?.context_length ?? DEFAULT_CONTEXT_WINDOW;
        contextWindowCache.set(model, contextLength);
        return contextLength;
    } catch {
        return DEFAULT_CONTEXT_WINDOW;
    }
}