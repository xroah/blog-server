import {
    Request,
    Response,
    NextFunction
} from "express";
import {
    queryCommentsByArticle,
    saveComment
} from "../../common/controllers/comment";
import { db, deleteMany } from "../../db";
import { COMMENTS, ARTICLES } from "../../db/collections";
import { ObjectId } from "mongodb";
import nonMatch from "../../common/controllers/nonMatch";

export { saveComment };

async function _queryComments(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const PAGE_SIZE = 30;
    const collection = db.collection(COMMENTS);
    let {
        before,
        after,
        pageSize
    } = req.query as any;
    let count = 0;
    let ret;
    pageSize = Number(pageSize) || PAGE_SIZE;

    if (pageSize < 0) pageSize = PAGE_SIZE;

    try {
        const pipeline = [];
        let countFilter: any;
        let sort = 1;

        //descending sort
        //prioritize after query
        if (after) {
            countFilter = {
                _id: {
                    $lt: new ObjectId(after)
                }
            };
            sort = -1;
        } else if (before) {
            countFilter = {
                _id: {
                    $gt: new ObjectId(before)
                }
            };
        }

        if (countFilter) {
            pipeline.push({
                $match: countFilter
            })
        }

        count = await collection.countDocuments(countFilter || {}, {});
        ret = await collection.aggregate([
            ...pipeline,
            {
                $sort: {
                    _id: sort
                }
            },
            {
                $limit: PAGE_SIZE
            },
            {
                $lookup: {
                    from: ARTICLES,
                    let: { aId: "$articleId" },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ["$$aId", "$_id"]
                            }
                        }
                    }, {
                        $project: {
                            title: 1
                        }
                    }],
                    as: "articleName"
                }
            },
            {
                $set: {
                    articleName: {
                        $arrayElemAt: ["$articleName", 0]
                    }
                }
            },
            {
                $set: {
                    articleName: "$articleName.title"
                }
            }
        ])
            .sort({ _id: -1 })
            .toArray()
    } catch (error) {
        return next(error);
    }

    res.json({
        code: 0,
        data: {
            list: ret,
            hasMore: count > PAGE_SIZE
        }
    });
}

export function queryComments(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { articleId } = req.query;

    if (articleId) {
        return queryCommentsByArticle(req, res, next);
    }

    _queryComments(req, res, next);
}

export async function delComments(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { commentId } = req.body;
    let ret;

    if (!commentId) {
        return next(new Error("没有id"));
    }

    try {
        const id = new ObjectId(commentId);

        ret = await deleteMany(
            COMMENTS,
            {
                $or: [{
                    _id: id
                }, {
                    replyTo: id
                }, {
                    root: id
                }]
            }
        );
    } catch (error) {
        return next(error);
    }

    if (ret.deletedCount) {
        return res.json({
            code: 0
        });
    }

    return nonMatch(req, res, next);
}