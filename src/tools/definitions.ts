import { toolRegistry } from "./registry.js";
import type { ToolRegistry } from "./types.js";


function buildToolDefinitions(toolRegistry: ToolRegistry) {
    const tools = [];
    for (let tool in toolRegistry) {

        const properties: Record<string, any> = {};

        if (toolRegistry[tool].parameters) {
            const parameters = toolRegistry[tool].parameters;
            parameters.forEach((parameter) => {
                properties[parameter.name] = {
                    type: parameter.type,
                    description: parameter.description
                }
            })

        }

        const required = Object.keys(properties);

        tools.push({
            type: "function" as const,
            name: tool,
            description: toolRegistry[tool].description,
            parameters: {
                type: "object",
                properties: properties,
                ...(required.length > 0 && {
                    required: required,
                })
            },
            strict: true
        })
    }
    return tools
}

export const toolDefinitions = buildToolDefinitions(toolRegistry);