import OpenAI from "openai";

export type ToolParameter = {
    name: string;
    type: string;
    description: string;
};

export type Tool = {
    description: string;
    parameters?: ToolParameter[];
    callback: (...args: any[]) => Promise<string | OpenAI.Responses.ResponseFunctionCallOutputItemList>;
    requiresPermission: boolean
};

export type ToolRegistry = Record<string, Tool>;