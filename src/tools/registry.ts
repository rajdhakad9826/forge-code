import OpenAI from "openai";
import { get_current_time } from "./get_current_time.js"
import { read_file } from "./read_file.js";
import { write_file } from "./write_file.js";
import { list_directory } from "./list_directory.js";

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
        description: "Get the current date and time in ISO 8601 format.",
        callback: get_current_time,
    },
    read_file: {
        description: "Read the complete UTF-8 text contents of a file from the current workspace. Returns the file contents as a string.",
        parameters: [
            {
                name: "path",
                type: "string",
                description: "The relative or absolute path of the file to read."
            }
        ],
        callback: read_file
    },
    write_file: {
        description: "Write UTF-8 text to a file in the current workspace. Creates the file if it does not exist and overwrites any existing contents.",
        parameters: [
            {
                name: "content",
                type: "string",
                description: "The complete text content to write to the file."
            },
            {
                name: "path",
                type: "string",
                description: "The relative or absolute path of the file to write."
            }
        ],
        callback: write_file
    },
    list_directory: {
        description: "List the immediate contents of a directory (non-recursive). Returns one entry per line, with directories prefixed by [DIR]. Use this tool to explore the workspace before reading files.",
        parameters: [
            {
                name: "path",
                type: "string",
                description: "The relative or absolute path of the directory to list. Defaults to the current working directory."
            }
        ],
        callback: list_directory
    }
}


