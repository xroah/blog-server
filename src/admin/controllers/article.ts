import {
    Request,
    Response,
    NextFunction
} from "express";
import {
    find,
    findOneAndUpdate,
    updateMany,
    findOneAndDelete,
    deleteMany
} from "../../db";
import { ARTICLES, IMAGES } from "../../db/collections";
import { ObjectID } from "mongodb";
import { unlink } from "fs";
import promisify from "../../common/utils/promisify";

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

    if (ret.value) {
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

async function deleteImages(articleId: ObjectID) {
    let ret;

    try {
        ret = await find(IMAGES, { articleId }).toArray();

        if (ret.length) {
            for (let img of ret) {
                promisify(unlink)(`${process.env.HOME}/${img.path}`);
            }
        }

        deleteMany(IMAGES, { articleId });
    } catch (error) {

    }
}

export async function deleteArticle(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { articleId } = req.body;
    let ret;

    try {
        if (!articleId) {
            throw new Error("没有传articleId");
        }
        
        const _id = new ObjectID(articleId);
        ret = await findOneAndDelete(ARTICLES, { _id });

        deleteImages(_id);
    } catch (error) {
        return next(error);
    }

    if (ret.value) {
        return res.json({ code: 0 });
    }

    res.json({
        code: 1,
        msg: "删除失败"
    });
}