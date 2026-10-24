import fs from 'fs/promises'
import pathModule from 'path'

function toInt(value: unknown): number | undefined {
    if (value === undefined || value === null || value === "") return undefined;
    const n = Number(value);
    return Number.isInteger(n) ? n : undefined;
}

const MAX_LINE_CHARS = 2_000; // must stay well below MAX_OUTPUT_CHARS
const MAX_OUTPUT_CHARS = 10_000;

export async function read_file({ path, start_line, end_line }: { path: string; start_line?: number | string | null; end_line?: number | string | null }) {
    try {
        const filePath = pathModule.resolve(process.cwd(), path)
        let content = await fs.readFile(filePath, 'utf8')

        if (content === "") return "(empty file)"

        const lines = content.split(/\r?\n/)

        const total = lines.length
        if (total === 0) return "(empty file)"

        const start = toInt(start_line) ?? 1
        const end = Math.min(toInt(end_line) ?? total, total)

        if (start < 1)
            return `Invalid start_line=${start}. Line numbers start at 1.`
        if (start > total)
            return `start_line ${start} is past the end of the file (${total} lines).`
        if (end < start)
            return `Invalid range: end_line (${end}) is less than start_line (${start}). File has ${total} lines.`

        const width = String(end).length
        let output = ""
        let last = start - 1

        for (let n = start; n <= end; n++) {
            let text = lines[n - 1]
            if (text.length > MAX_LINE_CHARS)
                text = text.slice(0, MAX_LINE_CHARS) + " ...[line truncated]"
            const row = `${String(n).padStart(width)}\t${text}\n`

            if (output.length + row.length > MAX_OUTPUT_CHARS) break
            output += row
            last = n
        }

        output = output.slice(0, -1)

        if (last < end)
            output += `\n[Truncated: showing lines ${start}-${last} of ${total}. Use start_line=${last + 1} to continue.]`

        return output

    } catch (error) {
        return error instanceof Error ? error.message : String(error)
    }
}
