import {
    Request,
    Response,
    NextFunction
} from "express";
import { join } from "path";

export default function nonMatch(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (req.xhr) {
        res.status(404);
        return res.json({
            code: 404,
            message: "对不起,您访问的资源不存在!"
        });
    }

    return res.sendFile(
        join(__dirname, "../../../static/404.html"),
        {
            headers: {
                contentType: "text/html"
            }
        },
        err => err && next(err)
    );
}