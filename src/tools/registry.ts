import { get_current_time } from "./get_current_time.js"
import { read_file } from "./read_file.js";
import { write_file } from "./write_file.js";
import { list_directory } from "./list_directory.js";
import { execute_shell } from "./execute_shell.js";
import type { ToolRegistry } from "./types.js";
import { edit_file } from "./edit_file.js";

export const toolRegistry: ToolRegistry = {
    get_current_time: {
        description: "Get the current date and time in ISO 8601 format.",
        callback: get_current_time,
        requiresPermission: false
    },
    read_file: {
        description: "Reads a file from the local filesystem. Returns file contents as a string with each line prefixed by its 1-based line number and a tab. The line number prefixes are for reference only and are not part of the file content. Optionally specify a line range for large files.",
        parameters: [
            {
                name: "path",
                type: "string",
                description: "The relative or absolute path of the file to read.",
                required: true
            },
            {
                name: "start_line",
                type: "integer",
                description: "The 1-based line number to start reading from. Defaults to the start of the file.",
                required: false
            },
            {
                name: "end_line",
                type: "integer",
                description: "The 1-based line number to stop reading at, inclusive. Defaults to the end of the file.",
                required: false
            }
        ],
        callback: read_file,
        requiresPermission: false
    },
    write_file: {
        description: "Write UTF-8 text to a file in the current workspace. Creates the file if it does not exist and overwrites any existing contents.",
        parameters: [
            {
                name: "content",
                type: "string",
                description: "The complete text content to write to the file.",
                required: true
            },
            {
                name: "path",
                type: "string",
                description: "The relative or absolute path of the file to write.",
                required: true
            }
        ],
        callback: write_file,
        requiresPermission: true
    },
    list_directory: {
        description: "List the immediate contents of a directory (non-recursive). Returns one entry per line, with directories prefixed by [DIR]. Use this tool to explore the workspace before reading files.",
        parameters: [
            {
                name: "path",
                type: "string",
                description: "The relative or absolute path of the directory to list. Defaults to the current working directory.",
                required: true
            }
        ],
        callback: list_directory,
        requiresPermission: false
    },
    execute_shell: {
        description: "Execute a shell command in the current workspace and return its standard output or error output.",
        parameters: [
            {
                name: "command",
                type: "string",
                description: "The shell command to execute.",
                required: true
            },
        ],
        callback: execute_shell,
        requiresPermission: true
    },
    edit_file: {
        description: "Edits an existing file in the current workspace by replacing an exact string with a new one.  old_string must match the file content exactly, including whitespace and indentation, and must be unique in the file: if it matches more than once the edit fails, so include enough surrounding lines to make it unique, or set replace_all to true to replace every occurrence (useful for renames). Do not include the line number prefixes shown by read_file in old_string or new_string; they are not part of the file. Returns the number of replacements made.",
        parameters: [
            {
                name: "path",
                type: "string",
                description: "The relative or absolute path of the file to edit.",
                required: true
            },
            {
                name: "old_string",
                type: "string",
                description: "The exact text to replace. Must be non-empty, must differ from new_string.",
                required: true
            },
            {
                name: "new_string",
                type: "string",
                description: "The text to replace old_string with. Use an empty string to delete old_string.",
                required: true
            },
            {
                name: "replace_all",
                type: "boolean",
                description: "If true, replace every occurrence of old_string. Defaults to false, in which case old_string must match exactly one location.",
                required: false
            }
        ],
        callback: edit_file,
        requiresPermission: true
    },
}


