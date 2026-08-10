export interface agentCallbacks {
    onTextDelta: (delta: string) => void,
    onPermissionRequest: (toolName: string, args: any) => Promise<boolean>
}