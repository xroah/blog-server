import { Request, Response, NextFunction } from "express";
import { queryArticle } from "./db";
import { response } from "./util";

async function getArticles(req: Request, res: Response, next: NextFunction) {
    let { query } = req;
    let secret = !!query.secret;
    let id = req.params.id;
    let { page, keywords } = query;
    let projection: Object = {
        secret: 0
    };
    if (!id) {
        projection = {
            content: 0
        };
    }
    let [list, total] = await queryArticle("articles", {
        page,
        keywords,
        secret,
        id,
        projection
    });
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

export {
    getArticles
}