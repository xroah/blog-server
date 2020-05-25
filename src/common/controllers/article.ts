import {
    Request,
    Response,
    NextFunction
} from "express";
import nonMatch from "./nonMatch";
import { ObjectID } from "mongodb";
import { findOne } from "../../db";
import { ARTICLES } from "../../db/collections";

async function queryArticleById(
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

export function queryArticle(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (req.query.articleId !== undefined) {
        return queryArticleById(req, res, next);
    }
}
