import type { ResponseInputItem } from "openai/resources/responses/responses";
import { ResponseFunctionToolCall } from "openai/resources/responses/responses.mjs";

export type ConversationItem = ResponseInputItem;


export type GenerateResult = { type: "assistant"; output: ConversationItem[] } | { type: "tool"; output: FunctionToolCall[] };

export type FunctionToolCall = ResponseFunctionToolCall