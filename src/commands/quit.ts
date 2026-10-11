import { exit } from "node:process";

export async function quit(): Promise<string[]> {
    exit()
}