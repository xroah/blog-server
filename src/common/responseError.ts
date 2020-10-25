import {
    Request,
    Response,
    NextFunction
} from "express"
import {join} from "path"

export default function responseError(
    req: Request,
    res: Response,
    next: NextFunction,
    code: number,
    msg: string,
    file: string
) {
    if (req.xhr) {
        return res.error(code, msg, code)
    }

    res.sendFile(
        join(__dirname, "../../static/", file),
        {
            headers: {
                contentType: "text/html"
            }
        },
        err => err && next(err)
    )
}