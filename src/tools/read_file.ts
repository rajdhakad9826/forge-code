import fs from 'fs/promises'
import path from 'path'
export async function read_file(file: string) {
    try {
        const dir = process.cwd()
        const filePath = path.resolve(dir, file)
        const content = await fs.readFile(filePath, 'utf8')
        return content
    } catch (error) {
        if (error instanceof Error)
            return error.message;
        else
            return String(error)
    }
}
