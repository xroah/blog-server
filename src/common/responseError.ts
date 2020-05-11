import {
    Request,
    Response,
    NextFunction
} from "express"
import { join } from "path";

export default function responseError(
    req: Request,
    res: Response,
    next: NextFunction, 
    code: number,
    msg: string,
    file: string
) {
    if (req.xhr) {
        res.status(code);
        return res.json({
            code,
            msg
        });
    }

    res.sendFile(
        join(__dirname, "../../static/", file),
        {
            headers: {
                contentType: "text/html"
            }
        },
        err => err && next(err)
    );
}