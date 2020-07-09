import {
    Request,
    Response,
    NextFunction
} from "express";
import { insertOne } from "../../db";
import { FEEDBACKS } from "../../db/collections";
import sanitize from "../../common/utils/sanitize";
import limitRequest from "../../common/utils/limitRequest";
import Code from "../../code";

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
        return res.error(Code.PARAM_ERROR, "请输入正确的内容");
    }

    if (content.length > 500) {
        return res.error(Code.PARAM_ERROR, "内容最多500个字");
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