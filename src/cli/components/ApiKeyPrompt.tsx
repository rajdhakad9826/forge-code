import { Box, Text, usePaste } from "ink";
import { useState } from "react";
import { saveApiKey } from "../../config/auth.js";
import TextInput from "ink-text-input";
import { logo } from "../constants.js";

export const ApiKeyPrompt = ({ onDone }: { onDone: () => void }) => {
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

