import {
    Request,
    Response,
    NextFunction
} from "express";
import { ObjectId } from "mongodb";
import { insertOne, findOne, db } from "../../db";
import { COMMENTS, ARTICLES } from "../../db/collections";

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
        homePage = "",
        userName
    } = req.body;
    const session = req.session!;
    const {
        lastSaveTime,
        saving
    } = session;

    //user can publish only one comment within 1 minute
    if (
        (lastSaveTime && Date.now() - lastSaveTime < 60 * 1000) ||
        saving
    ) {
        return res.json({
            code: 1,
            msg: "您的操作过于频繁，请稍后重试"
        });
    }

    session.lastSaveTime = null;
    session.saving = true;

    try {
        if (!articleId) {
            throw new Error("没有articleId");
        }

        if (!content) {
            throw new Error("没有评论内容");
        }

        if (typeof content !== "string") {
            throw new Error("内容格式错误");
        }

        if (content.length > 500) {
            throw new Error("内容超过字数限制，最多500个字符");
        }

        const aId = new ObjectId(articleId);
        const article = await findOne(
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

        if (!article) {
            throw new Error("文章不存在");
        }

        let replyToId;
        let rootId;

        if (replyTo) {
            replyToId = new ObjectId(replyToId);
        }

        if (root) {
            rootId = new ObjectId(root);
        }

        await insertOne(
            COMMENTS,
            {
                root: rootId,
                articleId: aId,
                replyTo: replyToId,
                content,
                createTime: new Date,
                userId: req.session!.userId || null,
                userName: userName ? String(userName) : null,
                homePage: homePage ? String(homePage) : null,
                isAuthor: article.authorId === req.session!.userId
            }
        );

        session.lastSaveTime = Date.now();
    } catch (error) {
        return next(error);
    } finally {
        session.saving = false;
    }

    res.json({ code: 0 });
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