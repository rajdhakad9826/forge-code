import type { ResponseInputItem } from "openai/resources/responses/responses";
import { ResponseFunctionToolCall } from "openai/resources/responses/responses.mjs";

export type ConversationItem = ResponseInputItem;

export type FunctionToolCall = ResponseFunctionToolCall

export class GenerationAbortedError extends Error { }

export type TokenUsage = {
    inputTokens: number;
    outputTokens: number;
    total: number;
}