import fs from 'fs/promises'
import path from 'path'
export async function write_file(content: string, file: string) {
    try {
        const dir = process.cwd()
        const filePath = path.resolve(dir, file)
        await fs.writeFile(filePath, content, 'utf-8');
        return "File written successfully."
    } catch (error) {
        if (error instanceof Error)
            return error.message;
        else
            return String(error)
    }
}
