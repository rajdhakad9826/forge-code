import { marked } from "marked";
import { markedTerminal } from "marked-terminal";
import chalk from "chalk";

marked.use(markedTerminal({
    showSectionPrefix: false,
    heading: chalk.bold,
    firstHeading: chalk.bold,
    strong: chalk.bold,
    em: chalk.italic,
    paragraph: chalk.reset,
    listitem: chalk.reset,
    blockquote: chalk.dim.italic,
    codespan: chalk.hex('#FFB454'),
    code: chalk.hex('#FFB454'),
    link: chalk.hex('#FFB454'),
    href: chalk.hex('#FFB454').underline,
    del: chalk.hex('#8A8578').strikethrough,
    hr: chalk.hex('#8A8578'),
    tableOptions: {
        style: {
            head: [],
            border: [],
        },
    },
}) as any);

export function renderMarkdown(content: string) {
    return marked.parse(content).trim();
}
