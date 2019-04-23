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
import {
    ARTICLES,
    RESOURCES
} from "../../db/collections";
import {delFiles} from "../../util";
import config  from "../../config";

const router = Router();

async function updateArticle(req: Request, res: Response, next: NextFunction) {
    let {
        id,
        title,
        content,
        secret,
        tags = [],
        clsId,
        summary,
        delImages
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
    let imgPaths = [];
    try {
        if (Array.isArray(delImages) && delImages.length) {
            for (let img of delImages) {
                imgPaths.push(`${config.uploadBaseDir}${img}`);
            }
            await del(RESOURCES, {
                path: {
                    $in: imgPaths
                }
            }, {
                many: true
            });
            delFiles(imgPaths);
        }
        ret = await findOneAndUpdate(
            ARTICLES,
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
        try {
            let ret = await del(ARTICLES, {_id: new ObjectID(id)});
            response(res, 0, ret);
        } catch (err) {
            next(err);
        }
    });

export default router;
