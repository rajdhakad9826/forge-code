const contextWindowCache = new Map<string, number>();

const DEFAULT_CONTEXT_WINDOW = 8000;

class ModelNotFoundError extends Error { }

export async function getContextWindow(model: string): Promise<number> {
    const cached = contextWindowCache.get(model);
    if (cached) return cached;

    try {
        const response = await fetch(`https://openrouter.ai/api/v1/model/${model}`);

        if (response.status === 404)
            throw new ModelNotFoundError(`Model '${model}' not found`);

        if (!response.ok) return DEFAULT_CONTEXT_WINDOW;

        const { data } = await response.json();
        const contextWindow = data?.context_length ?? DEFAULT_CONTEXT_WINDOW;

        contextWindowCache.set(model, contextWindow);
        return contextWindow;
    } catch (error) {
        if (error instanceof ModelNotFoundError) throw error;
        return DEFAULT_CONTEXT_WINDOW;
    }
}