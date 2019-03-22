import { Request, Response, NextFunction } from "express";
import { queryArticle } from "../db";
import { response } from "../common";
import { ObjectID } from "mongodb";

export default async function getArticles(req: Request, res: Response, next: NextFunction) {
    let { query } = req;
    let idLen = new ObjectID().toHexString().length;
    let isPublic = req.path.startsWith("/api/articles");
    let secret;
    let {
        id,
        page,
        keywords
    } = query;
    //public api, filter secret articles
    if (isPublic) {
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
            page,
            keywords,
            secret,
            id,
            count: isPublic,
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