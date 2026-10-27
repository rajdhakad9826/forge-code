import { deleteApiKey, readUserConfig, resolveApiKey } from "../config/auth.js";
import { CommandContext } from "./types.js";

export async function auth(args: string, ctx: CommandContext): Promise<string[]> {
    const sub = args.trim().toLowerCase();

    switch (sub) {
        case "login": {
            ctx.showApiKeyPrompt()
            return []
        }

        case "logout": {
            deleteApiKey()
            ctx.showApiKeyPrompt()
            return []
        }

        case "status": {
            const fromEnv = !!process.env.OPENROUTER_API_KEY
            const key = resolveApiKey()

            if (!key) {
                return ["Not authenticated. Run /auth login to add your API key."]
            }

            const masked = key.slice(0, 8) + "••••••••" + key.slice(-4)
            const source = fromEnv ? "environment variable (OPENROUTER_API_KEY)" : "~/.config/forge-code/config.json"

            return [
                `✓ Authenticated`,
                `  Key: ${masked}`,
                `  Source: ${source}`,
            ];
        }

        default:
            return [
                "Usage: /auth <subcommand>",
                "  login   — add or update your OpenRouter API key",
                "  logout  — remove your saved API key",
                "  status  — show current authentication state",
            ]
    }
}
