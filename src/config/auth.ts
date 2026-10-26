import { homedir } from "os";
import { join } from "path";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";

const CONFIG_DIR = join(homedir(), ".config", "forge-code");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export interface UserConfig {
    openrouter_api_key?: string;
    model?: string;
}

export function readUserConfig(): UserConfig {
    if (!existsSync(CONFIG_FILE)) return {};
    try {
        return JSON.parse(readFileSync(CONFIG_FILE, "utf-8")) as UserConfig;
    } catch {
        return {};
    }
}

export function resolveApiKey() {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (apiKey)
        return apiKey
    const configData = readUserConfig()
    if (configData.openrouter_api_key) {
        return configData.openrouter_api_key
    }
    return;
}

export function saveApiKey(apiKey: string) {
    if (!existsSync(CONFIG_FILE))
        mkdirSync(CONFIG_DIR, { recursive: true });
    const current = readUserConfig();
    writeFileSync(CONFIG_FILE, JSON.stringify({ ...current, openrouter_api_key: apiKey }, null, 2));
}

export function deleteApiKey() {
    if (!existsSync(CONFIG_FILE))
        return;
    const current = readUserConfig();
    writeFileSync(CONFIG_FILE, JSON.stringify({ model: current.model }, null, 2));
}


