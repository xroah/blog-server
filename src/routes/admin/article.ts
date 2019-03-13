import { Router } from "express";
import { response } from "../../common";
import { insert } from "../../db";
import { ObjectID } from "mongodb";
import { getArticles } from "../../common";

const router = Router();

router.route("/articles/list/:id?")
    .get(getArticles)
    .post(async (req, res, next) => {
        let {
            title,
            content,
            secret,
            tags,
            clsId,
            summary
        } = req.body;
        try {
            await insert("articles", {
                title,
                content,
                secret,
                tags,
                clsId: new ObjectID(clsId),
                summary,
                createTime: new Date(),
                lastUpdateTime: new Date(),
                totalViewed: 0,
                todayViewed: 0
            });
        } catch (error) {
            return next(error);
        }
        response(res, 0, null)
    }).put(async (req, res) => { });

export default router;
