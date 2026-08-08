export async function askForPermission(toolName: string, args: any, onPermissionRequest: (toolName: string, args: any) => Promise<boolean>): Promise<boolean> {
    const toolsRequiringPermission = new Set([
        'write_file',
        'execute_shell'
    ])

    if (!toolsRequiringPermission.has(toolName))
        return true;

    return onPermissionRequest(toolName, args);
}
