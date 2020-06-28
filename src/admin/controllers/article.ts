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
import { ARTICLES, IMAGES, COMMENTS } from "../../db/collections";
import { ObjectID } from "mongodb";
import { unlink } from "fs";
import promisify from "../../common/utils/promisify";

export { queryArticle } from "../../common/controllers/article";

//link to article, for deleting the image if the article does not exist
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
                relatedId: articleId,
                type: "article image"
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
    let {
        articleId,
        content,
        summary,
        title,
        categoryId,
        tag = "",
        secret = false,
        draft = false,
        images = []
    } = req.body;
    const isUpdate = !!articleId;
    const update: any = {
        content,
        summary,
        title,
        tag: tag.split(/;|；/g),
        secret,
        draft,
        modifyTime: new Date(),
        authorId: req.session!.userId
    };
    let _id;

    try {
        _id = new ObjectID(articleId || undefined);

        if (!draft) {
            if (!categoryId) {
                throw new Error("没有categoryId");
            }

            categoryId = new ObjectID(categoryId);
        }

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

        await findOneAndUpdate(
            ARTICLES,
            { _id },
            { $set: update },
            { upsert: true }
        );
    } catch (error) {
        return next(error);
    }

    res.json({
        code: 0,
        data: {
            _id
        }
    });
}

async function deleteImages(articleId: ObjectID) {
    let ret;

    try {
        ret = await find(IMAGES, { relatedId: articleId }).toArray();

        if (ret.length) {
            for (let img of ret) {
                promisify(unlink)(`${process.env.HOME}/${img.path}`);
            }
        }

        deleteMany(IMAGES, { articleId });
    } catch (error) {

    }
}

async function deleteComments(articleId: ObjectID) {
    try {
        await deleteMany(
            COMMENTS,
            {
                articleId
            }
        )
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
        deleteComments(_id);
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