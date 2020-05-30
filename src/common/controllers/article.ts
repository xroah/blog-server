import {
    Request,
    Response,
    NextFunction
} from "express";
import nonMatch from "./nonMatch";
import { ObjectID } from "mongodb";
import { findOne, db, find } from "../../db";
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
        page,
        pageSize
    } = req.query;
    let _pageSize = Number(pageSize) || 10;
    const filter: any = {};
    const projection = {
        projection: {
            content: 0
        }
    };
    let _page = Number(page) || 1;
    let ret;
    let count;

    if (!isAdmin) {
        filter.secret = {
            $not: {
                $eq: true
            }
        };
    }

    try {
        count = await db.collection(ARTICLES).countDocuments(filter);
        ret = await find(
            ARTICLES,
            filter,
            projection
        )
        .sort({_id: -1})
        .skip((_page - 1) * _pageSize)
        .limit(_pageSize)
        .toArray();
    } catch (error) {
        return next(error);
    }

    res.json({
        code: 0,
        data: {
            total: count,
            list: ret
        }
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
