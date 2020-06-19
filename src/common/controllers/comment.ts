import {
    Request,
    Response,
    NextFunction
} from "express";
import { ObjectId } from "mongodb";
import {
    insertOne,
    findOne,
    redisClient,
    db,
    redisGet,
    redisSet
} from "../../db";
import { COMMENTS, ARTICLES } from "../../db/collections";
import noop from "../utils/noop";

async function findArticle(articleId: ObjectId) {
    let article = await findOne(
        ARTICLES,
        {
            _id: articleId
        },
        {
            projection: {
                authorId: 1
            }
        }
    );

    return article;
}

export async function saveComment(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const {
        articleId,
        replyTo = null,
        root = null,
        content = "",
        homepage = "",
        username
    } = req.body;
    const { id } = req.session!;
    let result: any;

    //user can publish only one comment within 1 minute
    let saved = await redisGet(id);

    if (saved) {
        return next(new Error("你的操作过于频繁，请稍后再试"));
    }

    if (!articleId) {
        return next(new Error("没有articleId"));
    }

    if (!content) {
        return next(new Error("没有评论内容"));
    }

    if (typeof content !== "string") {
        return next(new Error("内容格式错误"));
    }

    if (content.length > 500) {
        return next(new Error("内容超过字数限制，最多500个字符"));
    }

    try {
        const aId = new ObjectId(articleId);
        const article = await findArticle(aId);

        if (!article) {
            return next(new Error("文章不存在"));
        }

        let replyToId;
        let rootId;

        if (replyTo) {
            replyToId = new ObjectId(replyTo);
        }

        if (root) {
            rootId = new ObjectId(root);
        }

        result = {
            root: rootId,
            articleId: aId,
            replyTo: replyToId,
            content,
            createTime: new Date,
            userId: req.session!.userId || new ObjectId(),
            username: username ? String(username) : null,
            homepage: homepage ? String(homepage) : null,
            isAuthor: article.authorId === req.session!.userId
        };

        await redisSet(id, "saved");

        const ret = await insertOne(
            COMMENTS,
            result
        );

        result._id = ret.insertedId;
        redisClient.expire(id, 60, noop);
    } catch (error) {
        redisClient.del(id, noop);
        return next(error);
    }

    res.json({
        code: 0,
        data: result
    });
}

export async function queryCommentsByArticle(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { articleId } = req.query;
    let ret;

    try {
        const aId = new ObjectId(articleId as any);

        ret = await db.collection(COMMENTS)
            .aggregate([
                {
                    $match: {
                        $and: [{
                            articleId: aId
                        }, {
                            root: null
                        }]
                    }
                },
                {
                    $sort: {
                        createTime: -1
                    }
                },
                {
                    $lookup: {
                        from: COMMENTS,
                        localField: "_id",
                        foreignField: "root",
                        as: "children"
                    }
                }
            ]).toArray();
    } catch (error) {
        return next(error);
    }

    res.json({
        code: 0,
        data: ret
    });
}