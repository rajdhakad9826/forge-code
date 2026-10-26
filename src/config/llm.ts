import { readUserConfig, writeModelToConfig } from "./auth.js";

let modelOverride: string | undefined;
const DEFAULT_MODEL: string = "openrouter/free";

export function setModelOverride(model: string) {
    modelOverride = model;
}

export function getModel() {
    const configModel = readUserConfig().model;
    return modelOverride ?? configModel ?? DEFAULT_MODEL;
}

export function saveModelToConfig(model: string) {
    writeModelToConfig(model);
}
