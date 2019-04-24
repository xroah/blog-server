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
    find
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
    let ret = null;
    let imgPaths = [];
    try {
        let _id = new ObjectID(id);
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
                        articleId: _id
                    }
                }
            );
        }
        ret = await findOneAndUpdate(
            ARTICLES,
            { _id },
            { $set: update },
            { upsert: !id }
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

export default router;
