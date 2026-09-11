import React, { useState, useEffect } from "react";
import { render, Box, Text } from "ink";
import _TextInput from "ink-text-input";
import Spinner from "ink-spinner";
import { runAgent } from "../agent/run.js";
import { SYSTEM_PROMPT } from "../agent/instructions.js";
import type { ConversationItem } from "../llm/types.js";
import { PermissionPrompt } from "./PermissionPrompt.js";
import { string, unknown } from "zod";

const TextInput = _TextInput as any;

const logo = `
█▀▀ █▀█ █▀█ █▀▀ █▀▀
█▀▀ █ █ █▀▄ █ █ █▀▀
▀   ▀▀▀ ▀ ▀ ▀▀▀ ▀▀▀
`

type ToolExecution = {
    call_id: string;
    name: string;
    args: any;
};

function ToolExecutionView({ name, args, status }: { name: string, args: any, status: "running" | "completed" }) {
    const isWrite = name === 'write_file';

    let argsStr = "";
    let writeContent = "";

    if (isWrite) {
        argsStr = args?.path || "";
        writeContent = args?.content || "";
    } else {
        if (typeof args === 'object' && args !== null) {
            argsStr = Object.values(args).join(" ");
        } else {
            argsStr = String(args || "");
        }
    }

    return (
        <Box flexDirection="column">
            <Box flexDirection="row">
                <Text color={status === "running" ? "#F2F0EB" : "#A3BE8C"}>
                    {status === "running" ? <Text color="#8A8578"><Spinner type="dots" /> </Text> : "✓ "}
                </Text>
                <Text bold color="#F2F0EB">{name} </Text>
                <Text color="#8A8578">{argsStr}</Text>
            </Box>

            {isWrite && writeContent && status === "completed" && (
                <Box flexDirection="column" paddingLeft={2} marginTop={1} marginBottom={1}>
                    {writeContent.split('\n').map((line: string, i: number) => (
                        <Text key={i}>
                            <Text color="#4C566A">{String(i + 1).padEnd(2, ' ')} </Text>
                            <Text color="#E5E9F0">{line}</Text>
                        </Text>
                    ))}
                </Box>
            )}
        </Box>
    );
}

const App = ({ initialPrompt }: { initialPrompt?: string }) => {
    const [conversation, setConversation] = useState<ConversationItem[]>([
        { role: "system", content: SYSTEM_PROMPT },
    ]);
    const [input, setInput] = useState("");
    const [streamedResponse, setStreamedResponse] = useState("");
    const [isAgentReplying, setIsAgentReplying] = useState(false);
    const [permissionRequest, setPermissionRequest] = useState<{ toolName: string, args: any, resolve: (allow: boolean) => void } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [toolExecutions, setToolExecutions] = useState<ToolExecution[]>([]);

    const handleSubmit = async (query: string) => {
        if (!query.trim()) return;

        const newConversation: ConversationItem[] = [...conversation, { role: "user", content: query }];
        setConversation(newConversation);
        setIsAgentReplying(true);
        setStreamedResponse("");
        setError(null);
        setToolExecutions([]);

        await runAgent(newConversation, {
            onTextDelta: (delta: string) => {
                setStreamedResponse(prev => prev + delta);
            },
            onConversationUpdate: (conversation: ConversationItem[]) => {
                setConversation([...conversation]);
            },
            onPermissionRequest: async (toolName, args) => {
                return new Promise<boolean>((resolve) => {
                    setPermissionRequest({
                        toolName,
                        args,
                        resolve: (allow: boolean) => {
                            setPermissionRequest(null);
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
                    }
                ]);
            },
            onToolEnd: (call_id) => {
                setToolExecutions(prev =>
                    prev.filter(tool => tool.call_id !== call_id)
                );
            }
        });

        setIsAgentReplying(false);
        setStreamedResponse("");
        setToolExecutions([]);
        // setConversation([...newConversation]);
    };

    useEffect(() => {
        if (initialPrompt) {
            handleSubmit(initialPrompt);
        }
    }, []);

    return (
        <Box flexDirection="column" padding={1}>

            <Box
                borderStyle="round"
                borderColor="#E8722C"
                padding={1}
                paddingX={2}
                flexDirection="row"
                marginBottom={1}
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
                    if (anyMsg.role === 'assistant' && anyMsg.content) {
                        return (
                            <Box key={`msg-${index}`} flexDirection="column" marginBottom={1}>
                                <Text color="#F2F0EB">{anyMsg.content}</Text>
                            </Box>
                        );
                    }
                    return null;
                })}
            </Box>

            {toolExecutions.length > 0 && (
                <Box flexDirection="column">
                    {toolExecutions.map((tool, index) => (
                        <ToolExecutionView
                            key={`tool-${index}`}
                            name={tool.name}
                            args={tool.args}
                            status="running"
                        />
                    ))}
                </Box>
            )}

            {isAgentReplying && !streamedResponse && toolExecutions.length == 0 && (
                <Box flexDirection="column">
                    <Text color="#8A8578">
                        <Spinner type="dots" /> Thinking...
                    </Text>
                </Box>
            )}

            {streamedResponse && (
                <Box flexDirection="column">
                    <Text color="#F2F0EB">{streamedResponse}</Text>
                </Box>
            )}

            {error && (
                <Box flexDirection="column" marginY={1}>
                    <Text color="red">✗ Error: {error}</Text>
                </Box>
            )}

            {permissionRequest && (
                <PermissionPrompt
                    toolName={permissionRequest.toolName}
                    args={permissionRequest.args}
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
                                if (isAgentReplying) return;
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
