import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

export const rl = createInterface({
    input: stdin,
    output: stdout
});
