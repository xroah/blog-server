import {
    Request,
    Response,
    NextFunction
} from "express";
import { ObjectID } from "mongodb";
import {
    findOneAndUpdate,
    findOneAndDelete,
    find,
    db,
    findOne
} from "../../db";
import { CATEGORIES, ARTICLES } from "../../db/collections";

export async function saveCategory(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const {
        categoryId,
        categoryName,
        categoryDesc
    } = req.body;
    const isEdit = !!categoryId;
    let ret;

    try {
        const _id = new ObjectID(categoryId);
        const data: any = {
            _id,
            name: categoryName,
            desc: categoryDesc,
            modifyTime: new Date()
        };

        if (!isEdit) {
            const exist = findOne(CATEGORIES, { name: categoryName });
            data.createTime = new Date();

            if (exist) {
                return next(new Error("分类已存在"));
            }
        }

        ret = await findOneAndUpdate(
            CATEGORIES,
            { _id },
            { $set: data },
            { upsert: true }
        );
    } catch (error) {
        return next(error);
    }

    if (ret.value) {
        return res.json({ code: 0 })
    }

    res.json({
        code: 1,
        msg: "保存失败!"
    });
}

export async function delCategory(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const {
        categoryId
    } = req.body;
    let ret;

    try {
        const _id = new ObjectID(categoryId);
        const article = await findOne(ARTICLES, { categoryId: _id });

        if (article) {
            return next(new Error("有文章属于该分类，不能删除"));
        }

        ret = await findOneAndDelete(CATEGORIES, { _id });
    } catch (error) {
        return next(error);
    }

    if (ret.value) {
        return res.json({ code: 0 });
    }

    res.json({
        code: 0,
        msg: "删除失败"
    });
}

export async function queryCategory(
    req: Request,
    res: Response,
    next: NextFunction
) {
    let ret;
    let { queryArticle } = req.query;

    try {
        let cursor;

        if (queryArticle !== "true") {
            cursor = find(CATEGORIES, {});
        } else {
            cursor = db.collection(CATEGORIES)
                .aggregate([
                    {
                        $lookup: {
                            from: "articles",
                            localField: "_id",
                            foreignField: "categoryId",
                            as: "articles"
                        }
                    },
                    {
                        $addFields: {
                            articleCount: {
                                $size: "$articles"
                            }
                        }
                    },
                    {
                        $project: {
                            articles: 0
                        }
                    }
                ]);
        }

        ret = await cursor.sort({ _id: -1 }).toArray();
    } catch (error) {
        return next(error);
    }

    res.json({
        code: 0,
        data: ret
    });
}