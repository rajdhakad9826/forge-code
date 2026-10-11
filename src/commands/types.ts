export type CommandContext = {
    setModel: (name: string) => void;
    setModelContextWindow: (size: number) => void
};


export type Command = {
    name: string;
    description: string;
    callback: (args: string, ctx: CommandContext) => Promise<string[]>;
};
