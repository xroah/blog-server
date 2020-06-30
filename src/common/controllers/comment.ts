import {
    Request,
    Response,
    NextFunction
} from "express";
import { ObjectId } from "mongodb";
import {
    insertOne,
    findOne,
    db,
} from "../../db";
import { COMMENTS, ARTICLES } from "../../db/collections";
import sanitize from "../utils/sanitize";
import limitRequest from "../utils/limitRequest";

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

async function findComment(root: ObjectId, replyTo: ObjectId) {
    let query: any;

    if (root.toHexString() === replyTo.toHexString()) {
        //query the root comment
        query = {
            _id: root
        }
    } else {
        query = {
            _id: replyTo,
            root
        }
    }

    const comment = await findOne(COMMENTS, query);

    return comment;
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
    let result: any;

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

    if (!username && !req.session!.userId) {
        return next(new Error("没有用户名"));
    }

    limitRequest(
        req,
        res,
        next,
        async () => {
            const aId = new ObjectId(articleId);
            const article = await findArticle(aId);

            if (!article) {//article may be deleted
                return new Error("文章不存在或已被删除");
            }

            let replyToId;
            let rootId;

            if (root) {
                rootId = new ObjectId(root);
                replyToId = new ObjectId(replyTo);

                const c = await findComment(rootId, replyToId);

                if (!c) {//the comment may be deleted
                    return new Error("回复的评论不存在或已经被删除");
                }
            }

            result = {
                root: rootId,
                articleId: aId,
                replyTo: replyToId,
                content: sanitize(content),
                createTime: new Date,
                userId: req.session!.userId || new ObjectId(),
                username: username ? sanitize(String(username)) : null,
                homepage: homepage ? sanitize(String(homepage)) : null,
                isAuthor: article.authorId === req.session!.userId
            };
            const ret = await insertOne(
                COMMENTS,
                result
            );

            result._id = ret.insertedId;

            return result;
        }
    );
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