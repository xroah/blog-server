import {
    Request,
    Response,
    NextFunction
} from "express"
import responseError from "../responseError"

export default function handleError(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.log(err)

    responseError(
        req,
        res,
        next,
        500,
        err.message || "服务器错误！",
        "500.html"
    )
}