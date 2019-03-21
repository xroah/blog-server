import { Request, Response, NextFunction } from "express";
import { queryArticle } from "../db";
import { response } from "../common";
import { ObjectID } from "mongodb";

export default async function getArticles(req: Request, res: Response, next: NextFunction) {
    let { query } = req;
    let idLen = new ObjectID().toHexString().length;
    let secret;
    let {
        id,
        page,
        keywords,
        comment
    } = query;
    if (!(<any>req.session).isAdmin) {
        secret = false;
    }
    let projection: any = {};
    if (!id) {
        //query article list
        projection = {
            content: 0
        };
    } else {
        if (id.length !== idLen) {
            return response(res, 500, null, "文章不存在!");
        }
        //query by id
        projection = {
            summary: 0
        };
    }
    let ret;
    try {
        ret = await queryArticle("articles", {
            comment: comment === "true" || comment === true,
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
        if (!data) {
            return response(res, 1, null, "文章不存在");
        }
    } else {
        data = {
            list,
            total
        };
    }
    response(res, 0, data);
}