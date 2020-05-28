import {
    Request,
    Response,
    NextFunction
} from "express";
import nonMatch from "./nonMatch";
import { ObjectID } from "mongodb";
import { findOne, find } from "../../db";
import { ARTICLES } from "../../db/collections";

async function queryById(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { articleId } = req.query;

    const isAdmin = (req.session as any).role === "admin";
    let ret;

    try {
        const _id = new ObjectID(articleId as string);
        const filter: any = {
            _id
        };

        if (!isAdmin) {
            filter.secret = {
                $not: {
                    $eq: true
                }
            }
        }

        ret = await findOne(
            ARTICLES,
            filter,
            {
                projection: {
                    _id: 0,
                    summary: 0,
                    createTime: 0,
                    modifyTime: 0
                }
            }
        );
    } catch (error) {
        return next(error);
    }

    if (!ret) {
        return nonMatch(req, res, next);
    }

    res.json({
        code: 0,
        data: ret
    })
}

async function queryByCondition(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const isAdmin = (req.session as any).role === "admin";
    const {
        after,
        prev,
        pageSize
    } = req.query;
    let _pageSize = Number(pageSize) || 10;
    let ret;
    const filter: any = {};

    if (!isAdmin) {
        filter.secret = {
            $not: {
                $eq: true
            }
        };
    }

    try {
        if (after) {
            filter._id = {
                $lt: new ObjectID(after as any)
            };
        } else if (prev) {
            filter._id = {
                $gt: new ObjectID(prev as any)
            };
        }

        ret = await find(
            ARTICLES,
            filter,
            {
                projection: {
                    content: 0
                }
            }
        )
            .sort({ _id: -1 })
            .limit(_pageSize)
            .toArray();
    } catch (error) {
        return next(error);
    }

    res.json({
        code: 0,
        data: ret
    });
}

export function queryArticle(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (req.query.articleId !== undefined) {
        return queryById(req, res, next);
    }

    queryByCondition(req, res, next);
}
