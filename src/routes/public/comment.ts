import {
    Router,
    Request,
    Response,
    NextFunction
} from "express";
import {
    insert,
    findOne,
    aggregate
} from "../../db";
import {response} from "../../common";
import {ObjectID} from "mongodb";

const router = Router();

async function beforeSave(req: Request, res: Response, next: NextFunction) {
    let {
        articleId,
        content
    } = req.body;
    let article;
    if (!articleId) {
        return response(res, 1, null, "缺少id!");
    } else if (!content) {
        return response(res, 1, null, "缺少评论内容!");
    }
    try {
        article = await findOne("articles", {
            _id: new ObjectID(articleId)
        });
    } catch (err) {
        return next(err);
    }
    if (article) {
        next();
    } else {
        response(res, 1, null, "文章不存在!");
    }
}

async function saveComment(req: Request, res: Response, next: NextFunction) {
    let {
        articleId,
        content,
        username = null,
        replyTo,
        userHomepage = null,
        rootComment
    } = req.body;
    let s: any = req.session;
    let ret;
    try {
        ret = await insert(
            "comments",
            {
                articleId: new ObjectID(articleId),
                content,
                rootComment: rootComment ? new ObjectID(rootComment) : null,
                username: s.isAdmin ? "作者" : username,
                userHomepage: s.isAdmin ? null : userHomepage,
                replyTo: replyTo ? new ObjectID(replyTo) : null,
                createTime: new Date(),
                audited: false
            }
        );
    } catch (err) {
        return next(err)
    }
    response(res, 0, ret);
}

async function getComments(req: Request, res: Response, next: NextFunction) {
    let {articleId} = req.query;
    let idLen = new ObjectID().toHexString().length;
    if (!articleId || articleId.length !== idLen) {
        return response(res, 0, []);
    }
    let ret;
    try {
        articleId = new ObjectID(articleId);
        ret = await aggregate(
            "comments",
            [{
                $match: {
                    articleId,
                    rootComment: {
                        $in: [null]
                    }
                }
            }, {
                $lookup: {
                    from: "comments",
                    let: {rid: "$_id"},
                    pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ["$$rid", "$rootComment"]
                            }
                        }
                    }, {
                        $lookup: {
                            from: "comments",
                            let: {rto: "$replyTo"},
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: ["$$rto", "$_id"]
                                    }
                                }
                            }, {
                                $project: {
                                    username: 1,
                                    userHomepage: 1
                                }
                            }],
                            as: "reply"
                        }
                    }, {
                        $addFields: {
                            replyToUser: {
                                $arrayElemAt: ["$reply", 0]
                            }
                        }
                    }, {
                        $project: {
                            reply: 0,
                            replyTo: 0
                        }
                    }],
                    as: "repliers"
                }
            }]
        ).toArray();

    } catch (err) {
        return next(err);
    }
    response(res, 0, ret);
}

router.route("/comment")
    .post(beforeSave, saveComment)
    .get(getComments);

export default router;