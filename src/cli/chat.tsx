import React, { useState, useEffect } from "react";
import { render, Box, Text } from "ink";
import _TextInput from "ink-text-input";
import Spinner from "ink-spinner";
import { runAgent } from "../agent/run.js";
import { SYSTEM_PROMPT } from "../agent/instructions.js";
import type { ConversationItem } from "../llm/types.js";
import { PermissionPrompt } from "./PermissionPrompt.js";
import { ToolExecutionView } from "./ToolExecutionView.js";

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

type AgentState =
    | "thinking"
    | "tool_running"
    | "awaiting_permission"
    | "idle";

const App = ({ initialPrompt }: { initialPrompt?: string }) => {
    const [conversation, setConversation] = useState<ConversationItem[]>([
        { role: "system", content: SYSTEM_PROMPT },
    ]);
    const [input, setInput] = useState("");
    const [streamedResponse, setStreamedResponse] = useState("");
    const [agentState, setAgentState] = useState<AgentState>("idle")
    const [permissionRequest, setPermissionRequest] = useState<{ toolName: string, args: any, resolve: (allow: boolean) => void } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [toolExecutions, setToolExecutions] = useState<ToolExecution[]>([]);

    const handleSubmit = async (query: string) => {
        if (!query.trim()) return;

        const newConversation: ConversationItem[] = [...conversation, { role: "user", content: query }];
        setConversation(newConversation);
        setAgentState("thinking");
        setStreamedResponse("");
        setError(null);
        setToolExecutions([]);

        await runAgent(newConversation, {
            onTextDelta: (delta: string) => {
                setStreamedResponse(prev => prev + delta);
            },
            onConversationUpdate: (conversation: ConversationItem[]) => {
                setStreamedResponse("");
                setConversation([...conversation]);
            },
            onPermissionRequest: async (toolName, args) => {
                setAgentState("awaiting_permission");
                return new Promise<boolean>((resolve) => {
                    setPermissionRequest({
                        toolName,
                        args,
                        resolve: (allow: boolean) => {
                            setPermissionRequest(null);
                            setAgentState("thinking");
                            resolve(allow);
                        }
                    });
                });
            },
            onError: (error: Error) => {
                setError(error.message);
            },
            onToolStart: (tool) => {
                setAgentState("tool_running");
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
                setAgentState("thinking");
                setToolExecutions(prev =>
                    prev.filter(tool => tool.call_id !== call_id)
                );
            }
        });

        setAgentState("idle");
        setStreamedResponse("");
        setToolExecutions([]);
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
                    if (anyMsg.role === 'assistant' && typeof anyMsg.content === 'string' && anyMsg.content.trim()) {
                        return (
                            <Box key={`msg-${index}`} flexDirection="column">
                                <Text color="#F2F0EB">{anyMsg.content.trim()}</Text>
                            </Box>
                        );
                    }
                    return null;
                })}
            </Box>

            {agentState == "tool_running" && (
                <>
                    {toolExecutions.map((tool, index) => (
                        <ToolExecutionView
                            key={`tool-${index}`}
                            name={tool.name}
                            args={tool.args}
                            status="running"
                        />
                    ))}
                </>
            )}

            {streamedResponse && (
                <Box flexDirection="column">
                    <Text color="#F2F0EB">{streamedResponse}</Text>
                </Box>
            )}

            {agentState == "thinking" && (
                <Box flexDirection="column">
                    <Text color="#8A8578">
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
                    toolName={permissionRequest.toolName}
                    args={permissionRequest.args}
                    onResolve={permissionRequest.resolve}
                />
            )}

            {agentState !== "awaiting_permission" && (
                <Box flexDirection="column" marginTop={1}>
                    <Box borderStyle="round" borderColor="#8A8578" paddingX={1}>
                        <Text color="#E8722C">❯ </Text>
                        <TextInput
                            value={input}
                            onChange={setInput}
                            onSubmit={(val: string) => {
                                if (agentState !== "idle") return;
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
