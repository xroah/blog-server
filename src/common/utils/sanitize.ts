export default function sanitize(content: string) {
    if (typeof content !== "string") content = String(content);

    return content.replace(/>/g, "&gt;")
        .replace(/</g, "&lt;");
}