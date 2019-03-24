import {
    Router,
    Request,
    Response,
    NextFunction
} from "express";
import {response} from "../../common";
import {
    findOneAndUpdate,
    del
} from "../../db";
import {ObjectID} from "mongodb";
import {getArticles} from "../../common";

const router = Router();

async function updateArticle(req: Request, res: Response, next: NextFunction) {
    let {
        id,
        title,
        content,
        secret,
        tags = [],
        clsId,
        summary
    } = req.body;
    let update: any = {
        title,
        content,
        secret,
        tags,
        clsId: new ObjectID(clsId),
        summary,
        lastUpdateTime: new Date()
    };
    if (!title || secret === undefined || !clsId || !content || !summary) {
        return next(new Error("参数错误"));
    }
    if (!id) {
        if (req.method.toLowerCase() === "put") {
            return next(new Error("没有传id"));
        }
        update = {
            ...update,
            createTime: new Date(),
            totalViewed: 0,
            todayViewed: 0
        }
    }
    let _id = new ObjectID(id);
    let ret = null;
    try {
        ret = await findOneAndUpdate(
            "articles",
            {_id},
            {$set: update},
            {upsert: !id}
        );
    } catch (error) {
        return next(error);
    }
    response(res, 0, ret)
}

router.route("/articles/list")
    .get(getArticles)
    .post(updateArticle)
    .put(updateArticle)
    .delete(async (req, res, next) => {
        let {id} = req.body;
        if (!id) {
            return next(new Error("没有传id"));
        }
        let ret = null;
        try {
            ret = await del("articles", {_id: new ObjectID(id)})
        } catch (err) {
            next(err);
        }
        response(res, 0, ret);
    });

export default router;
