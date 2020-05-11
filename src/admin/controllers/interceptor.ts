import {
    Request,
    Response,
    NextFunction
} from "express";
import responseError from "../../common/responseError";

export default function interceptor(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const session = req.session || { role: null };

    if (session.role !== "admin") {
        return responseError(
            req,
            res,
            next,
            403,
            "对不起，您没有访问权限！",
            "403.html"
        );
    }

    next();
}