import {
    Request,
    Response,
    NextFunction
} from "express";
import {
    queryCommentsByArticle,
    saveComment
} from "../../common/controllers/comment";
import { db } from "../../db";
import { COMMENTS, ARTICLES } from "../../db/collections";
import { ObjectId } from "mongodb";

export { saveComment };

async function _queryComments(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const PAGE_SIZE = 30;
    const collection = db.collection(COMMENTS);
    let {
        prev,
        after
    } = req.query as any;
    let count = 0;
    let ret;

    try {
        const pipeline = [];
        let countFilter: any;

        //descend
        if (prev) {
            countFilter = {
                _id: {
                    $gt: new ObjectId(prev)
                }
            };
        } else if (after) {
            countFilter = {
                _id: {
                    $lt: new ObjectId(after)
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
            {
                $sort: {
                    _id: -1
                }
            },
            ...pipeline,
            {
                $limit: PAGE_SIZE
            },
            {
                $lookup: {
                    from: ARTICLES,
                    let: {aId: "$articleId"},
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
        ]).toArray()
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