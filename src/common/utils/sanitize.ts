export default function sanitize(content: string) {
    return content.replace(/>/g, "&gt;")
        .replace(/</g, "&lt;");
}