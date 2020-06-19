import {
    Request,
    Response,
    NextFunction
} from "express";
import {
    redisGet,
    redisSet,
    insertOne,
    redisClient
} from "../../db";
import { FEEDBACKS } from "../../db/collections";
import noop from "../../common/utils/noop";

export async function saveFeedback(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { id } = req.session!;
    const {
        content = "",
        email = null
    } = req.body;
    const sessId = id + "feedback";
    const saved = await redisGet(sessId);

    if (saved) {
        return next(new Error("您的操作过于频繁，请稍候重试"));
    }

    if (typeof content !== "string" || !content) {
        return next(new Error("请输入正确的内容"));
    }

    if (content.length > 500) {
        return next(new Error("内容最多500个字"));
    }

    try {
        await insertOne(
            FEEDBACKS,
            {
                email,
                content,
                createTime: new Date
            }
        );

        redisSet(sessId, "saved");
        redisClient.expire(sessId, 60, noop);
    } catch (error) {
        redisClient.del(sessId, noop);

        return next(error);
    }

    res.json({ code: 0 });
}