import { ToolStatus } from "../agent/types.js";

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
