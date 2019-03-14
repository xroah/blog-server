import { Request, Response, NextFunction } from "express";
import { queryArticle } from "../db";
import { response } from "../common";

export default async function getArticles(req: Request, res: Response, next: NextFunction) {
    let { query } = req;
    let secret;
    let { id, page, keywords } = query;
    let projection: Object = {
        secret: 0
    };
    if (!(<any>req.session).isAdmin) {
        secret = false;
    }
    if (!id) {
        projection = {
            content: 0
        };
    }
    let ret;
    try {
        ret = await queryArticle("articles", {
            page,
            keywords,
            secret,
            id,
            projection
        });
    } catch (error) {
        return next(error);
    }
    let [list, total] = ret;
    let data = {};
    if (id) {
        data = list[0];
    } else {
        data = {
            list,
            total
        };
    }
    response(res, 0, data);
}