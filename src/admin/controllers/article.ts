import {
    Request,
    Response,
    NextFunction
} from "express";
import { findOneAndUpdate, updateMany } from "../../db";
import { ARTICLES, IMAGES } from "../../db/collections";
import { ObjectID } from "mongodb";

function updateImage(images: Array<any>, articleId: ObjectID) {
    return updateMany(
        IMAGES,
        {
            path: {
                $in: images
            }
        },
        {
            $set: {
                articleId
            }
        },
        { upsert: true }
    );
}

export async function saveArticle(
    req: Request,
    res: Response,
    next: NextFunction
) {

    let ret;
    let {
        articleId,
        content,
        summary,
        title,
        categoryId,
        tag = "",
        secret = false,
        images = []
    } = req.body;
    const isUpdate = !!articleId;
    const update: any = {
        content,
        summary,
        title,
        tag: tag.split(/;；/g),
        secret,
        modifyTime: new Date()
    };

    try {
        let _id = new ObjectID(articleId);
        categoryId = new ObjectID(categoryId);
        update.categoryId = categoryId;

        if (images.length) {
            await updateImage(images, _id);
        }

        if (isUpdate) {
            update.modifyTime = new Date();
        } else {
            update.createTime = new Date();
            update.todayViewed = 0;
            update.totalViewed = 0;
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

    if (ret.ok) {
        res.json({
            code: 0,
            msg: "保存成功"
        });
    } else {
        res.json({
            code: 1,
            msg: "保存失败"
        });
    }
}
