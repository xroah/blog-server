import {
    Request,
    Response,
    NextFunction
} from "express";
import nonMatch from "./nonMatch";
import { ObjectID } from "mongodb";
import { db, find } from "../../db";
import { ARTICLES, CATEGORIES } from "../../db/collections";
import isAdmin from "../utils/isAdmin";

async function queryById(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { articleId } = req.query;

    const admin = isAdmin(req);
    let ret;

    try {
        const _id = new ObjectID(articleId as string);
        const filter: any = {
            _id
        };

        if (!admin) {
            filter.secret = {
                $not: {
                    $eq: true
                }
            }
        }

        ret = await db.collection(ARTICLES)
            .aggregate([
                {
                    $match: filter
                },
                {
                    $lookup: {
                        from: CATEGORIES,
                        localField: "categoryId",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                {
                    $set: {
                        category: {
                            $arrayElemAt: ["$category", 0]
                        }
                    }
                },
                {
                    $addFields: {
                        categoryName: "$category.name"
                    }
                },
                {
                    $project: {
                        summary: 0,
                        category: 0,
                        modifyTime: 0
                    }
                }
            ]).toArray();
        ret = ret[0];
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
    const admin = isAdmin(req);
    const {
        page,
        pageSize,
        secret,
        draft,
        categoryId
    } = req.query;
    let _pageSize = Number(pageSize) || 10;
    const filter: any = {};
    const options: any = {
        projection: {
            content: 0,
            secret: 0
        }
    };
    const nonSecret = {
        $not: {
            $eq: true
        }
    };
    const nonDraft = {
        $not: {
            $eq: true
        }
    };
    let _page = Number(page) || 1;
    let ret;
    let count;

    if (!admin) {
        filter.secret = nonSecret;
        filter.draft = nonDraft;
        options.projection.draft = 0;
    } else {
        if (secret === "true") {
            filter.secret = { $eq: true };
        } else if (secret === "false") {
            filter.secret = nonSecret;
        }

        if (draft === "true") {
            filter.draft = { $eq: true };
        } else if (draft === "false") {
            filter.draft = nonDraft;
        }
    }

    try {
        if (categoryId) {
            filter.categoryId = new ObjectID(categoryId as any);
        }

        count = await db.collection(ARTICLES).countDocuments(filter, {});
        ret = await find(
            ARTICLES,
            filter,
            options
        )
            .sort({ _id: -1 })
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

export async function queryPrevAndAfter(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { articleId } = req.query;
    const admin = isAdmin(req);
    const ret: any = {};
    let filter: any = {};
    const _find = (filter: any, sort: number) => {
        return find(ARTICLES, filter)
            .sort({ _id: sort })
            .limit(1)
            .project({ _id: 1 })
            .toArray();
    }

    try {
        const _id = new ObjectID(articleId as any);

        if (!admin) {
            filter = {
                secret: {
                    $not: {
                        $eq: true
                    }
                },
                draft: {
                    $not: {
                        $eq: true
                    }
                }
            };
        }

        const next = await _find(
            {
                ...filter,
                _id: {
                    $lt: _id
                }
            },
            -1
        )
        const prev = await _find(
            {
                ...filter,
                _id: {
                    $gt: _id
                }
            },
            1
        )

        ret.prev = prev[0];
        ret.next = next[0];
    } catch (error) {
        return next(error);
    }

    res.json({
        code: 0,
        data: ret
    });
}
