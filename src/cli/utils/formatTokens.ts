const tokenFormatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
});

export function formatTokens(tokens: number): string {
    return tokenFormatter.format(tokens);
}