import fs from 'fs/promises'
import pathModule from 'path'
export async function write_file({ path, content }: { path: string; content: string; }) {
    try {
        const workspace = process.cwd()
        const filePath = pathModule.resolve(workspace, path)
        await fs.writeFile(filePath, content, 'utf-8');
        return "File written successfully."
    } catch (error) {
        if (error instanceof Error)
            return error.message;
        else
            return String(error)
    }
}
