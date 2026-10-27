import React, { useState, useEffect } from "react";
import { render, Box, Text, useInput, Static, usePaste } from "ink";
import _TextInput from "ink-text-input";
import Spinner from "ink-spinner";
import { runAgent } from "../agent/run.js";
import { SYSTEM_PROMPT } from "../agent/instructions.js";
import type { ConversationItem, FunctionToolCall, TokenUsage } from "../llm/types.js";
import { PermissionPrompt } from "./PermissionPrompt.js";
import { ToolExecutionView } from "./ToolExecutionView.js";
import { abortConnection } from "../llm/generate.js";
import { exit } from "node:process";
import { getModel } from "../config/llm.js";
import { getContextWindow } from "../config/models.js";
import { commandRegistry } from "../commands/registry.js";
import { formatTokens } from "./utils/formatTokens.js";
import { renderMarkdown } from "./utils/markdown.js";
import { ToolStatus } from "../agent/types.js";
import { resolveApiKey, saveApiKey } from "../config/auth.js";

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
    status: ToolStatus;
};

export type FeedItem =
    | {
        id: string;
        type: "user";
        content: string;
    }
    | {
        id: string;
        type: "assistant";
        content: string;
    }
    | {
        id: string;
        type: "command";
        command: string;
        output: string[];
    }
    | {
        id: string;
        type: "tool_execution";
        callId: string;
        name: string;
        args: any;
        status: ToolStatus;
        result?: string;
    }
    | {
        id: string;
        type: "notice";
        kind: "cancelled" | "info" | "warning";
        message: string;
    }
    | {
        id: string;
        type: "error";
        message: string;
    };

type TurnState = "idle" | "active";

const ApiKeyPrompt = ({ onDone }: { onDone: () => void }) => {
    const [apiKey, setApiKey] = useState("");
    const [error, setError] = useState("");

    usePaste((text) => {
        setApiKey((prev) => prev + text);
    });

    const handleSubmit = (val: string) => {
        const trimmed = val.trim();
        if (!trimmed) {
            setError("API key cannot be empty. Please enter your OpenRouter API key.");
            return;
        }
        saveApiKey(trimmed);
        onDone();
    };

    return (
        <Box flexDirection="column" paddingX={2} paddingY={1}>
            <Box
                borderStyle="round"
                borderColor="#E8722C"
                padding={1}
                paddingX={2}
                flexDirection="column"
                marginBottom={1}
            >
                <Box flexDirection="row" justifyContent="center" marginBottom={1}>
                    <Text bold color="#E8722C">{logo.trim()}</Text>
                </Box>

                <Box flexDirection="column" alignItems="center" marginBottom={1}>
                    <Text bold color="#F2F0EB">Welcome to Forge Code!</Text>
                    <Text color="#8A8578">agent for your terminal</Text>
                </Box>

                <Box
                    borderStyle="single"
                    borderColor="#E8722C"
                    borderLeft={false}
                    borderRight={false}
                    borderBottom={false}
                    marginY={1}
                />

                <Box flexDirection="column" marginBottom={1}>
                    <Text bold color="#F2F0EB">OpenRouter API Key Required</Text>
                    <Text color="#8A8578">
                        Get your free API key at{" "}
                        <Text color="#E8722C">openrouter.ai/keys</Text>
                    </Text>
                    <Text color="#8A8578">
                        Your key is saved locally at{" "}
                        <Text color="#FFB454">~/.config/forge-code/config.json</Text>
                    </Text>
                </Box>

                <Box borderStyle="round" borderColor="#8A8578" paddingX={1}>
                    <Text color="#E8722C">🔑 </Text>
                    <TextInput
                        value={apiKey}
                        onChange={setApiKey}
                        onSubmit={handleSubmit}
                        mask="*"
                        placeholder="sk-or-..."
                    />
                </Box>

                {error ? (
                    <Box marginTop={1}>
                        <Text color="#BF616A">✗ {error}</Text>
                    </Box>
                ) : (
                    <Box marginTop={1}>
                        <Text color="#8A8578">Press </Text>
                        <Text color="#FFB454">Enter</Text>
                        <Text color="#8A8578"> to save and continue</Text>
                    </Box>
                )}
            </Box>
        </Box>
    );
}


const App = ({ initialPrompt }: { initialPrompt?: string }) => {
    const [ready, setReady] = useState(() => resolveApiKey() !== undefined);
    const showApiKeyPrompt = () => setReady(false);

    useInput((input, key) => {
        if (key.ctrl && input === 'c')
            abortConnection();

        if (key.ctrl && input === 'c' && turnState === "idle")
            exit();
    })

    const [feed, setFeed] = useState<FeedItem[]>([]);
    const [llmContext, setLlmContext] = useState<ConversationItem[]>([
        { role: "system", content: SYSTEM_PROMPT }
    ]);

    const [input, setInput] = useState("");
    const [streamedResponse, setStreamedResponse] = useState("");
    const [turnState, setTurnState] = useState<TurnState>("idle")
    const [isGenerating, setIsGenerating] = useState(false);
    const [permissionRequest, setPermissionRequest] = useState<{ tool: FunctionToolCall, resolve: (allow: boolean) => void } | null>(null);
    const [toolExecutions, setToolExecutions] = useState<ToolExecution[]>([]);
    const [model, setModel] = useState<string>("");
    const [modelContextWindow, setModelContextWindow] = useState<number>(0);
    const [tokenUsage, setTokenUsage] = useState<TokenUsage>({
        inputTokens: 0,
        outputTokens: 0,
        total: 0
    })

    usePaste((text) => {
        if (ready && turnState === "idle" && !permissionRequest) {
            setInput((prev) => prev + text);
        }
    });

    const handleCommand = async (input: string) => {
        const [name, ...args] = input.slice(1).trim().split(/\s+/);

        const command = commandRegistry[name];
        if (!command) {
            setFeed(prev => [
                ...prev,
                { id: crypto.randomUUID(), type: "command", command: input, output: [`Unknown command: /${name}`] }
            ]);
            return;
        }

        try {
            const output = await command.callback(
                args.join(" "),
                { setModel, setModelContextWindow, showApiKeyPrompt }
            );

            setFeed(prev => [
                ...prev,
                { id: crypto.randomUUID(), type: "command", command: input, output: Array.isArray(output) ? output : [output] }
            ]);

        } catch (error: any) {
            setFeed(prev => [
                ...prev,
                { id: crypto.randomUUID(), type: "error", message: error.message || String(error) }
            ])
        }
    };

    const handleSubmit = async (query: string) => {
        if (!query.trim()) return;

        const userMsg: ConversationItem = { role: "user", content: query }
        const newLlmContext: ConversationItem[] = [...llmContext, userMsg]
        setLlmContext(newLlmContext)
        setFeed(prev => [...prev, { id: crypto.randomUUID(), type: "user", content: query }])

        setTurnState("active");
        setIsGenerating(false);
        setStreamedResponse("");
        setToolExecutions([]);
        const toolStatuses = new Map<string, ToolStatus>();

        await runAgent(newLlmContext, modelContextWindow, {
            onGenerateStart: () => setIsGenerating(true),
            onGenerateEnd: () => setIsGenerating(false),
            onTextDelta: (delta: string) => {
                setStreamedResponse(prev => prev + delta);
            },
            onConversationUpdate: (updatedContext: ConversationItem[], newOutputs: ConversationItem[]) => {
                setStreamedResponse("")
                setLlmContext([...updatedContext])

                for (const item of newOutputs) {
                    const anyItem = item as any;
                    if (anyItem.type === "function_call") {
                        setFeed(prev => [...prev, {
                            id: anyItem.call_id,
                            type: "tool_execution",
                            callId: anyItem.call_id,
                            name: anyItem.name,
                            args: JSON.parse(anyItem.arguments || "{}"),
                            status: toolStatuses.get(anyItem.call_id) ?? "completed"
                        }]);
                    } else if (anyItem.role === "assistant" && typeof anyItem.content === "string" && anyItem.content.trim()) {
                        setFeed(prev => [...prev, {
                            id: crypto.randomUUID(),
                            type: "assistant",
                            content: anyItem.content
                        }])
                    }
                }

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
                setFeed(prev => [...prev, { id: crypto.randomUUID(), type: "error", message: error.message }]);
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
            onToolEnd: (call_id, status) => {
                toolStatuses.set(call_id, status)
                setToolExecutions(prev =>
                    prev.filter(tool => tool.call_id !== call_id)
                );
            },
            onCancelled: () => {
                setFeed(prev => [...prev, { id: crypto.randomUUID(), type: "notice", kind: "cancelled", message: "⊘ Request cancelled." }]);
            },
            onUsage: (usage: TokenUsage) => {
                setTokenUsage(usage)
            }
        });

        setTurnState("idle");
        setIsGenerating(false);
        setStreamedResponse("");
        setToolExecutions([]);
    };

    useEffect(() => {
        const currentModel = getModel();
        setModel(currentModel);
        getContextWindow(currentModel)
            .then(window => {
                setModelContextWindow(window);
                if (initialPrompt) {
                    handleSubmit(initialPrompt);
                }
            })
            .catch(err => {
                setFeed(prev => [...prev, { id: crypto.randomUUID(), type: "error", message: err.message }]);
                setModelContextWindow(8000);
            });
    }, []);

    function FeedItemView({ item }: { item: FeedItem }) {
        switch (item.type) {
            case "user":
                return (
                    <Box marginY={1}>
                        <Text color="#FFB454"><Text color="#E8722C">❯ </Text>{item.content}</Text>
                    </Box>
                );

            case "command":
                return (
                    <Box flexDirection="column" marginY={1}>
                        <Text color="#8A8578"><Text color="#E8722C">❯ </Text>{item.command}</Text>
                        <Box marginBottom={1}></Box>
                        {item.output.map((line, idx) => (
                            <Text color="#FFB454" key={idx}>{line}</Text>
                        ))}
                    </Box>
                );

            case "assistant":
                return (
                    <Box flexDirection="column" marginTop={1}>
                        <Text color="#F2F0EB"><Text color="#E8722C">⚒ </Text>{renderMarkdown(item.content)}</Text>
                    </Box>
                );

            case "tool_execution":
                return (
                    <ToolExecutionView
                        name={item.name}
                        args={item.args}
                        status={item.status}
                    />
                );

            case "notice":
                return (
                    <Box marginY={1}>
                        <Text color="#ded3c5ff">{item.message}</Text>
                    </Box>
                );

            case "error":
                return (
                    <Box flexDirection="column" marginY={1}>
                        <Text color="#BF616A">✗ Error: {item.message}</Text>
                    </Box>
                );
        }
    }


    return ready ? (
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

            {
                feed.map((item) => <FeedItemView key={item.id} item={item} />)
            }

            {streamedResponse.trim() && (
                <Box flexDirection="column" marginTop={1}>
                    <Text color="#F2F0EB"><Text color="#E8722C">⚒ </Text>{renderMarkdown(streamedResponse)}</Text>
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

            {permissionRequest && (
                <PermissionPrompt
                    toolName={permissionRequest.tool.name}
                    args={JSON.parse(permissionRequest.tool.arguments)}
                    onResolve={permissionRequest.resolve}
                />
            )}

            <Box marginTop={1}>
                <Text color="#FFB454">{model}</Text>
                <Text color="#8A8578"> · {formatTokens(tokenUsage.total)}/{formatTokens(modelContextWindow)} ({(tokenUsage.total / modelContextWindow * 100).toFixed(2)}%)</Text>
            </Box>
            {
                !permissionRequest && (
                    <Box flexDirection="column">
                        <Box borderStyle="round" borderColor="#8A8578" paddingX={1}>
                            <Text color="#E8722C">❯ </Text>
                            <TextInput
                                value={input}
                                onChange={setInput}
                                onSubmit={(val: string) => {
                                    if (turnState !== "idle") return;
                                    setInput("");
                                    if (val.startsWith("/"))
                                        handleCommand(val);
                                    else
                                        handleSubmit(val);
                                }}
                            />
                        </Box>
                    </Box>
                )
            }

        </Box >
    ) : (
        <ApiKeyPrompt onDone={() => setReady(true)} />
    );
};

export async function startChat(initialPrompt?: string) {
    const { waitUntilExit } = render(<App initialPrompt={initialPrompt} />, { exitOnCtrlC: false });
    await waitUntilExit();
}
