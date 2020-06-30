import {
    Request,
    Response,
    NextFunction
} from "express";
import { insertOne } from "../../db";
import { FEEDBACKS } from "../../db/collections";
import sanitize from "../../common/utils/sanitize";
import limitRequest from "../../common/utils/limitRequest";

export async function saveFeedback(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const {
        content = "",
        email = null
    } = req.body;

    if (typeof content !== "string" || !content) {
        return next(new Error("请输入正确的内容"));
    }

    if (content.length > 500) {
        return next(new Error("内容最多500个字"));
    }

    limitRequest(
        req,
        res,
        next,
        async () => {
            await insertOne(
                FEEDBACKS,
                {
                    email: email ? sanitize(email) : "",
                    content: sanitize(content),
                    createTime: new Date
                }
            );

            return null;
        }
    );
}