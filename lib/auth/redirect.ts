export function getSafeNextPath(value: unknown): string | null {
    if (typeof value !== "string") return null;
    if (!value.startsWith("/") || value.startsWith("//")) return null;
    return value;
}

export function getLoginPathWithNext(nextPath: string | null): string {
    if (!nextPath) return "/login";
    return `/login?next=${encodeURIComponent(nextPath)}`;
}
