import {
    Request,
    Response,
    NextFunction
} from "express";
import {
    queryCommentsByArticle,
    saveComment
} from "../../common/controllers/comment";
import { deleteMany } from "../../db";
import { COMMENTS, ARTICLES } from "../../db/collections";
import { ObjectId } from "mongodb";
import pagination from "../../common/utils/pagination";
import Code from "../../code";

export { saveComment };

async function _queryComments(
    req: Request,
    res: Response,
    next: NextFunction
) {
    pagination(
        req,
        res,
        next,
        COMMENTS,
        [{
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
        }]
    );
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
        return res.error(Code.PARAM_ERROR, "没有commentId");
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
        return res.json2(Code.SUCCESS);
    }

    res.error(Code.NOT_EXISTS, "评论不存在或已被删除")
}