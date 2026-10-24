import pathModule from 'path'
import fs from 'fs/promises'

type editFileInput = {
    path: string;
    old_string: string;
    new_string: string;
    replace_all?: boolean
}

const toLF = (s: string) => s.replace(/\r\n/g, "\n")

export async function edit_file({ path, old_string, new_string, replace_all = false }: editFileInput) {
    if (!old_string || old_string === new_string)
        return "Edit failed: old_string must be non-empty and different from new_string."

    try {
        const filePath = pathModule.resolve(process.cwd(), path)
        const raw = await fs.readFile(filePath, 'utf8')

        const isCRLF = raw.includes("\r\n")
        const content = toLF(raw)
        const oldStr = toLF(old_string)
        const newStr = toLF(new_string)

        const count = content.split(oldStr).length - 1;

        if (count === 0)
            return `Edit failed: old_string not found in ${path}`;

        if (count > 1 && !replace_all)
            return `Edit failed: old_string matches ${count} locations in ${path}, but replace_all is false. ` +
                `Include more surrounding lines in old_string so it matches exactly one location, ` +
                `or set replace_all to true to replace all ${count} occurrences.`

        let updated = content.split(oldStr).join(newStr)
        if (isCRLF) updated = updated.replace(/\n/g, "\r\n")

        await fs.writeFile(filePath, updated, "utf8");

        return `Edit completed: ${count} replacement${count === 1 ? "" : "s"} made in ${path}.`
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return `Edit failed: ${message}`;
    }
}