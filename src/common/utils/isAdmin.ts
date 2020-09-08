import { Request } from "express"

export default function isAdmin(req: Request) {
    const { role } = req.session as any

    return role === "admin" && req.app.mountpath.includes("admin")
}