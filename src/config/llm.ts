let modelOverride: string | undefined;
const MODEL = process.env.MODEL
const DEFAULT_MODEL: string = "openrouter/free"

export function setModelOverride(model: string) {
    modelOverride = model;
}

export function getModel() {
    return modelOverride ?? MODEL ?? DEFAULT_MODEL;
}
