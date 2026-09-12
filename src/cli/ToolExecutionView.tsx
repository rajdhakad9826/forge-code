import { Box, Text } from "ink";
import Spinner from "ink-spinner";


export function ToolExecutionView({ name, args, status }: { name: string, args: any, status: "running" | "completed" | "awaiting_permission" | "failed" }) {
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
                {status === "running" && <Text color="#8A8578"><Spinner type="dots" /> </Text>}
                {status === "completed" && <Text color="#A3BE8C">✓ </Text>}
                {status === "awaiting_permission" && <Text color="#EBCB8B">◍ </Text>}
                {status === "failed" && <Text color="#BF616A">✗ </Text>}
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
