import {
    Router,
    Request,
    Response,
    NextFunction
} from "express";
import { response } from "../../common";
import {
    findOneAndUpdate,
    del,
    updateMany,
    find,
    findOne
} from "../../db";
import { ObjectID } from "mongodb";
import { getArticles } from "../../common";
import {
    ARTICLES,
    RESOURCES
} from "../../db/collections";
import { delFiles } from "../../util";
import config from "../../config";
import { resolve } from "path";

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
        delImages,
        uploadedImages
    } = req.body;
    let update: any = {
        title,
        content,
        secret,
        tags,
        summary,
        lastUpdateTime: new Date(),
        isDraft: false
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
    let ret = null;
    let imgPaths = [];
    try {
        let _id = new ObjectID(id);
        update.clsId = new ObjectID(clsId);
        //delete the images when edit
        if (Array.isArray(delImages) && delImages.length) {
            for (let img of delImages) {
                imgPaths.push(resolve(`${config.uploadBaseDir}${img}`));
            }
            await del(
                RESOURCES,
                {
                    path: {
                        $in: imgPaths
                    }
                },
                {
                    many: true
                });
            delFiles(imgPaths);
        }
        //update articleId of the uploaded images 
        if (Array.isArray(uploadedImages) && uploadedImages.length) {
            await updateMany(
                RESOURCES,
                {
                    relPath: {
                        $in: uploadedImages
                    }
                },
                {
                    $set: {
                        articleId: _id,
                        name: title
                    }
                }
            );
        }
        ret = await findOneAndUpdate(
            ARTICLES,
            { _id },
            { $set: update },
            { upsert: true }
        );
    } catch (error) {
        return next(error);
    }
    response(res, 0, ret)
}

router.route("/articles/list")
    .get(async (req, res, next) => {
        let { isDraft, id } = req.query;
        if (isDraft && JSON.parse(isDraft)) {
            try {
                let ret = await findOne(
                    ARTICLES,
                    { _id: new ObjectID(id) }
                );
                response(res, 0, ret);
            } catch (err) {
                next(err);
            }
        } else {
            getArticles(req, res, next);
        }
    })
    .post(updateArticle)
    .put(updateArticle)
    .delete(async (req, res, next) => {
        let { id } = req.body;
        try {
            let _id = new ObjectID(id);
            //find images of the article, then delete them from db and disk
            let images: Array<any> = await find(RESOURCES, {
                articleId: _id
            }).toArray();
            if (images.length) {
                images = images.map(img => img.path);
                await del(RESOURCES, {
                    articleId: _id
                }, {
                        many: true
                    });
                delFiles(images);
            }
            let ret = await del(ARTICLES, { _id });
            response(res, 0, ret);
        } catch (err) {
            next(err);
        }
    });

async function updateDraft(req: Request, res: Response, next: NextFunction) {
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
        clsId,
        summary,
        lastUpdateTime: new Date(),
        isDraft: true
    };
    if (!id) {
        update.createTime = new Date();
    }
    try {
        let _id = new ObjectID(id);
        let ret = await findOneAndUpdate(
            ARTICLES,
            { _id },
            { $set: update },
            { upsert: true }
        );
        response(res, 0, ret);
    } catch (err) {
        next(err);
    }
}

router
    .route("/articles/drafts")
    .get(async (req, res, next) => {
        try {
            let ret = await find(ARTICLES, { isDraft: true }).toArray();
            response(res, 0, ret);
        } catch (err) {
            next(err);
        }
    })
    .put(updateDraft)
    .post(updateDraft);

export default router;
