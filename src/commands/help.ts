import { commandRegistry } from "./registry.js"

export async function help(): Promise<string[]> {
    return Object.values(commandRegistry).map((command) => {
        return `${command.name} - ${command.description}`
    })
}