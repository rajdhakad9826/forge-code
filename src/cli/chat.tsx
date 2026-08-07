import React, { useState, useEffect } from "react";
import { render, Box, Text, useApp } from "ink";
import _TextInput from "ink-text-input";
import Spinner from "ink-spinner";
import { runAgent } from "../agent/run.js";
import { SYSTEM_PROMPT } from "../agent/instructions.js";
import type { ConversationItem } from "../llm/types.js";

const TextInput = _TextInput as any;

const logo = `
█▀▀ █▀█ █▀█ █▀▀ █▀▀
█▀▀ █ █ █▀▄ █ █ █▀▀
▀   ▀▀▀ ▀ ▀ ▀▀▀ ▀▀▀
`

const App = ({ initialPrompt }: { initialPrompt?: string }) => {
    const [conversation, setConversation] = useState<ConversationItem[]>([
        { role: "system", content: SYSTEM_PROMPT },
    ]);
    const [input, setInput] = useState("");
    const [streamedResponse, setStreamedResponse] = useState("");
    const [isAgentReplying, setIsAgentReplying] = useState(false);

    const handleSubmit = async (query: string) => {
        if (!query.trim()) return;

        const newConversation: ConversationItem[] = [...conversation, { role: "user", content: query }];
        setConversation(newConversation);
        setIsAgentReplying(true);
        setStreamedResponse("");

        await runAgent(newConversation, (delta: string) => {
            setStreamedResponse(prev => prev + delta);
        });

        setIsAgentReplying(false);
        setStreamedResponse("");
        setConversation([...newConversation]);
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
                    if (anyMsg.role === 'assistant' && anyMsg.content) {
                        return (
                            <Box key={`msg-${index}`} flexDirection="column">
                                <Text color="#F2F0EB">{anyMsg.content}</Text>
                            </Box>
                        );
                    }
                    return null;
                })}
            </Box>

            {isAgentReplying && !streamedResponse && (
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

        </Box>
    );
};

export async function startChat(initialPrompt?: string) {
    const { waitUntilExit } = render(<App initialPrompt={initialPrompt} />);
    await waitUntilExit();
}
