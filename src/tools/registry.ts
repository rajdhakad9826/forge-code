import OpenAI from "openai";
import { get_current_time } from "./get_current_time.js"

type ToolParameter = {
    name: string;
    type: string;
    description: string;
};

type Tool = {
    description: string;
    parameters?: ToolParameter[];
    callback: (...args: any[]) => Promise<string | OpenAI.Responses.ResponseFunctionCallOutputItemList>;
};

export type ToolRegistry = Record<string, Tool>;

export const toolRegistry: ToolRegistry = {
    get_current_time: {
        description: "Get Current Time",
        callback: get_current_time,
    },
}


