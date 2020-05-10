import {
    Request,
    Response,
    NextFunction
} from "express";
import { join } from "path";

export default function interceptor(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const session = req.session;

    if (!session || session.role !== "admin") {
        if (req.xhr) {
            res.status(403);
            
            return res.json({
                code: 403,
                msg: "对不起，您没有访问权限!"
            });
        }

        return res.sendFile(
            join(__dirname, "../../../static/403.html"),
            {
                headers: {
                    contentType: "text/html"
                }
            },
            err => err && next(err)
        );
    }
}