import { rl } from "../cli/io.js";

export async function askForPermission(toolName: string, args: any): Promise<boolean> {
    const toolsRequiringPermission = ['write_file', 'execute_shell'];

    if (!toolsRequiringPermission.includes(toolName)) {
        return true;
    }

    if (toolName === "execute_shell") {
        console.log(`\nThe agent wants to execute:\n\n$ ${args.command}\n`);
    } else if (toolName === "write_file") {
        console.log(`\nThe agent wants to write:\n\n${args.path}\n`);
    }

    const answer = await rl.question('Allow? (y/n) ');
    return answer.trim().toLowerCase() === 'y';
}
