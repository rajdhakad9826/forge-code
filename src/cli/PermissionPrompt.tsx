import React, { useState } from "react";
import { Box, Text, useInput } from "ink";

export const PermissionPrompt = ({ toolName, args, onResolve }: { toolName: string, args: any, onResolve: (allow: boolean) => void }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const options = [
        "1. Yes",
        "2. No, tell forge what to do differently"
    ];

    useInput((input, key) => {
        if (key.upArrow) {
            setSelectedIndex((prev) => Math.max(0, prev - 1));
        } else if (key.downArrow) {
            setSelectedIndex((prev) => Math.min(options.length - 1, prev + 1));
        } else if (key.return) {
            onResolve(selectedIndex === 0);
        } else if (input === '1') {
            onResolve(true);
        } else if (input === '2') {
            onResolve(false);
        }
    });


    let title = "Tool call";
    let subtitle = "";
    let content = "";

    if (toolName === "execute_shell") {
        title = "Run command";
        subtitle = "";
        content = args.command;
    } else if (toolName === "write_file") {
        title = "Write file";
        subtitle = args.path;
        content = args.content ? `+ ${args.content}` : "";
    } else {
        title = toolName;
        content = JSON.stringify(args, null, 2);
    }

    return (
        <Box borderStyle="round" borderColor="#E8722C" padding={1} flexDirection="column" marginY={1}>
            <Text bold color="#F2F0EB">{title}</Text>
            {subtitle && (
                <Box>
                    <Text color="#E8722C">{subtitle}</Text>
                </Box>
            )}

            <Box backgroundColor="#2B2B2B" padding={1} marginTop={1} marginBottom={1} flexDirection="column">
                <Text color="#A8C7A1">{content}</Text>
            </Box>

            <Box flexDirection="column">
                {options.map((opt, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                        <Box key={index} backgroundColor={isSelected ? "#E8722C" : undefined} paddingX={1}>
                            <Text color={isSelected ? "#1A1A1A" : "#F2F0EB"}>
                                {isSelected ? "> " : "  "}{opt}
                            </Text>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};