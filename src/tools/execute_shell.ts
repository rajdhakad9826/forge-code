import { exec } from "node:child_process"
import util from "node:util"
const execPromise = util.promisify(exec);

export async function execute_shell({ command }: { command: string }) {
    try {
        const { stdout, stderr } = await execPromise(command, { cwd: process.cwd() });
        let output = "";
        if (stdout) output += `stdout:\n${stdout}`;
        if (stderr) output += `\nstderr:\n${stderr}`;
        return output.trim();
    } catch (error) {
        if (error instanceof Error)
            return error.message
        return String(error)
    }
}
