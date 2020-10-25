import {
    Request,
    Response,
    NextFunction
} from "express"
import responseError from "../../common/responseError"

export default function interceptor(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const session: any = req.session || {}
    const auth = req.get("authorization") || ""
    const token = auth.split(/\s+/)

    if (
        (
            session.role === "admin" &&
            token[0] === "token" &&
            token[1] === session.token
        ) ||
        (
            req.method.toLowerCase() === "post" &&
            /\/login\/?/.test(req.url)
        )
    ) {
        return next()
    }

    responseError(
        req,
        res,
        next,
        403,
        "对不起，您没有访问权限！",
        "403.html"
    )
}
