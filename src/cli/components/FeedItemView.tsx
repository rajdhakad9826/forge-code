import { Box, Text } from "ink";
import { ToolExecutionView } from "../ToolExecutionView.js";
import { FeedItem } from "../types.js";
import { renderMarkdown } from "../utils/markdown.js";

export const FeedItemView = ({ item }: { item: FeedItem }) => {
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

