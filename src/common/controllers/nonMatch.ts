import {
    Request,
    Response,
    NextFunction
} from "express"
import responseError from "../responseError"

export default function nonMatch(
    req: Request,
    res: Response,
    next: NextFunction
) {
    responseError(
        req,
        res,
        next,
        404,
        "对不起,您访问的资源不存在!",
        "404.html"
    )
}