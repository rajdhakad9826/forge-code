import fs from 'fs/promises'
import pathModule from 'path'
export async function read_file({ path }: { path: string }) {
    try {
        const workspace = process.cwd()
        const filePath = pathModule.resolve(workspace, path)
        const content = await fs.readFile(filePath, 'utf8')
        return content
    } catch (error) {
        if (error instanceof Error)
            return error.message;
        else
            return String(error)
    }
}
