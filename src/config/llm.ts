let modelOverride: string | undefined;
const MODEL = process.env.MODEL
const DEFAULT_MODEL: string = "inclusionai/ling-3.0-flash-vl:free"

export function setModelOverride(model: string) {
    modelOverride = model;
}

export function getModel() {
    return modelOverride ?? MODEL ?? DEFAULT_MODEL;
}
