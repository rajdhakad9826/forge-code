import React, { useState, useEffect } from "react";
import { render, Box, Text } from "ink";
import _TextInput from "ink-text-input";
import Spinner from "ink-spinner";
import { runAgent } from "../agent/run.js";
import { SYSTEM_PROMPT } from "../agent/instructions.js";
import type { ConversationItem, FunctionToolCall } from "../llm/types.js";
import { PermissionPrompt } from "./PermissionPrompt.js";
import { ToolExecutionView } from "./ToolExecutionView.js";
import { marked } from "marked";
import { markedTerminal } from 'marked-terminal';
import chalk from "chalk";

marked.use(markedTerminal({
    showSectionPrefix: false,
    heading: chalk.bold,
    firstHeading: chalk.bold,
    strong: chalk.bold,
    em: chalk.italic,
    paragraph: chalk.reset,
    listitem: chalk.reset,
    blockquote: chalk.dim.italic,
    codespan: chalk.hex('#E8722C'),
    code: chalk.hex('#E8722C'),
    link: chalk.hex('#E8722C'),
    href: chalk.hex('#E8722C').underline,
    del: chalk.hex('#8A8578').strikethrough,
    hr: chalk.hex('#8A8578'),
    tableOptions: {
        style: {
            head: [],
            border: [],
        },
    },

}) as any);

const TextInput = _TextInput as any;

const logo = `
█▀▀ █▀█ █▀█ █▀▀ █▀▀
█▀▀ █ █ █▀▄ █ █ █▀▀
▀   ▀▀▀ ▀ ▀ ▀▀▀ ▀▀▀
`

type ToolStatus = "running" | "awaiting_permission" | "completed" | "failed";

type ToolExecution = {
    call_id: string;
    name: string;
    args: any;
    status: ToolStatus;
};

type TurnState = "idle" | "active";

const App = ({ initialPrompt }: { initialPrompt?: string }) => {
    const [conversation, setConversation] = useState<ConversationItem[]>([
        { role: "system", content: SYSTEM_PROMPT },
    ]);
    const [input, setInput] = useState("");
    const [streamedResponse, setStreamedResponse] = useState("");
    const [turnState, setTurnState] = useState<TurnState>("idle")
    const [isGenerating, setIsGenerating] = useState(false);
    const [permissionRequest, setPermissionRequest] = useState<{ tool: FunctionToolCall, resolve: (allow: boolean) => void } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [toolExecutions, setToolExecutions] = useState<ToolExecution[]>([]);

    const handleSubmit = async (query: string) => {
        if (!query.trim()) return;

        const newConversation: ConversationItem[] = [...conversation, { role: "user", content: query }];
        setConversation(newConversation);
        setTurnState("active");
        setIsGenerating(false);
        setStreamedResponse("");
        setError(null);
        setToolExecutions([]);

        await runAgent(newConversation, {
            onGenerateStart: () => setIsGenerating(true),
            onGenerateEnd: () => setIsGenerating(false),
            onTextDelta: (delta: string) => {
                setStreamedResponse(prev => prev + delta);
            },
            onConversationUpdate: (conversation: ConversationItem[]) => {
                setStreamedResponse("");
                setConversation([...conversation]);
            },
            onPermissionRequest: async (tool) => {
                setToolExecutions(prev => prev.map(t => t.call_id === tool.call_id ? { ...t, status: "awaiting_permission" } : t));
                return new Promise<boolean>((resolve) => {
                    setPermissionRequest({
                        tool,
                        resolve: (allow: boolean) => {
                            setPermissionRequest(null);
                            setToolExecutions(prev => prev.map(t => t.call_id === tool.call_id ? { ...t, status: "running" } : t));
                            resolve(allow);
                        }
                    });
                });
            },
            onError: (error: Error) => {
                setError(error.message);
            },
            onToolStart: (tool) => {
                setToolExecutions(prev => [
                    ...prev,
                    {
                        call_id: tool.call_id,
                        name: tool.name,
                        args: JSON.parse(tool.arguments),
                        status: "running"
                    }
                ]);
            },
            onToolEnd: (call_id) => {
                setToolExecutions(prev =>
                    prev.filter(tool => tool.call_id !== call_id)
                );
            }
        });

        setTurnState("idle");
        setIsGenerating(false);
        setStreamedResponse("");
        setToolExecutions([]);
    };

    useEffect(() => {
        if (initialPrompt) {
            handleSubmit(initialPrompt);
        }
    }, []);

    return (
        <Box flexDirection="column" paddingX={1}>

            <Box
                borderStyle="round"
                borderColor="#E8722C"
                padding={1}
                paddingX={2}
                flexDirection="row"
            >
                <Box flexDirection="column" width="50%" alignItems="center" justifyContent="center">
                    <Text bold color="#F2F0EB">Welcome to Forge Code!</Text>
                    <Box marginY={1}>
                        <Text bold color="#E8722C">{logo.trim()}</Text>
                    </Box>
                    <Text color="#8A8578">agent for your terminal</Text>
                    <Text color="#8A8578">cwd: {process.cwd()}</Text>
                </Box>

                <Box
                    borderStyle="single"
                    borderColor="#E8722C"
                    borderTop={false}
                    borderRight={false}
                    borderBottom={false}
                    marginRight={2}
                    marginLeft={1}
                />

                <Box flexDirection="column" width="50%" justifyContent="center">
                    <Box flexDirection="column" marginBottom={1}>
                        <Text bold color="#E8722C">Tips for getting started</Text>
                        <Text color="#F2F0EB">Ask the agent to create a new app or clone a repository</Text>
                    </Box>
                </Box>
            </Box>

            <Box flexDirection="column">
                {conversation.filter(c => (c as any).role !== 'system').map((msg, index) => {
                    const anyMsg = msg as any;
                    if (anyMsg.role === 'user') {
                        return (
                            <Box key={`msg-${index}`} flexDirection="column" marginY={1}>
                                <Text color="#FFB454"><Text color="#E8722C">❯ </Text>{anyMsg.content}</Text>
                            </Box>
                        );
                    }
                    if (anyMsg.type === 'function_call') {
                        let parsedArgs = anyMsg.arguments;
                        try {
                            if (typeof parsedArgs === 'string') parsedArgs = JSON.parse(parsedArgs);
                        } catch (e) { }
                        return (
                            <ToolExecutionView
                                key={`msg-${index}`}
                                name={anyMsg.name}
                                args={parsedArgs}
                                status="completed"
                            />
                        );
                    }
                    if (anyMsg.role === 'assistant' && typeof anyMsg.content === 'string' && anyMsg.content.trim()) {
                        return (
                            <Box key={`msg-${index}`} flexDirection="column" marginTop={1}>
                                <Text color="#F2F0EB"><Text color="#E8722C">⚒ </Text>{marked.parse(anyMsg.content).trim()}</Text>
                            </Box>
                        );
                    }
                    return null;
                })}
            </Box>

            {streamedResponse.trim() && (
                <Box flexDirection="column">
                    <Text color="#F2F0EB"><Text color="#E8722C">⚒ </Text>{streamedResponse.trim()}</Text>
                </Box>
            )}

            {toolExecutions.length > 0 && (
                <Box flexDirection="column">
                    {toolExecutions.map((tool, index) => (
                        <ToolExecutionView
                            key={`tool-${index}`}
                            name={tool.name}
                            args={tool.args}
                            status={tool.status}
                        />
                    ))}
                </Box>
            )}

            {isGenerating && (
                <Box flexDirection="column" marginTop={1}>
                    <Text color="#ffffffff">
                        <Spinner type="dots" /> Thinking...
                    </Text>
                </Box>
            )}

            {error && (
                <Box flexDirection="column" marginY={1}>
                    <Text color="red">✗ Error: {error}</Text>
                </Box>
            )}

            {permissionRequest && (
                <PermissionPrompt
                    toolName={permissionRequest.tool.name}
                    args={JSON.parse(permissionRequest.tool.arguments)}
                    onResolve={permissionRequest.resolve}
                />
            )}

            {!permissionRequest && (
                <Box flexDirection="column" marginTop={1}>
                    <Box borderStyle="round" borderColor="#8A8578" paddingX={1}>
                        <Text color="#E8722C">❯ </Text>
                        <TextInput
                            value={input}
                            onChange={setInput}
                            onSubmit={(val: string) => {
                                if (turnState !== "idle") return;
                                setInput("");
                                handleSubmit(val);
                            }}
                        />
                    </Box>
                </Box>
            )}

        </Box>
    );
};

export async function startChat(initialPrompt?: string) {
    const { waitUntilExit } = render(<App initialPrompt={initialPrompt} />);
    await waitUntilExit();
}
