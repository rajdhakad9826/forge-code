import fs from 'fs/promises'
import pathModule from 'path'

export async function list_directory({ path = "." }: { path?: string } = {}) {
    try {
        const workspace = process.cwd()
        const dirPath = pathModule.resolve(workspace, path)
        const entries = await fs.readdir(dirPath, { withFileTypes: true })
        const result = entries.map(entry => {
            const prefix = entry.isDirectory() ? "[DIR] " : ""
            return `${prefix}${entry.name}`
        })
        return result.join("\n")
    } catch (error) {
        if (error instanceof Error) return error.message;
        else return String(error)
    }
}