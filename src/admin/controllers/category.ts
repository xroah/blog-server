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
import fs from "fs";
import promisify from "../../common/utils/promisify";

export async function saveCategory(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const {
        categoryId,
        categoryName,
        categoryDesc,
        cover
    } = req.body;
    const isEdit = !!categoryId;
    let ret;

    try {
        const _id = new ObjectID(categoryId);
        const data: any = {
            _id,
            name: categoryName,
            desc: categoryDesc,
            modifyTime: new Date(),
            cover
        };

        if (!isEdit) {
            const exist = await findOne(CATEGORIES, { name: categoryName });
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

    res.json({ code: 0 });
}

async function delCover(url: string) {
    try {
        await promisify(fs.unlink)(`${process.env.HOME}${url}`);
    } catch (error) {

    }
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
        delCover(ret.value.cover);

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
                            let: { cId: "$_id" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: ["$$cId", "$categoryId"]
                                    }
                                }
                            }, {
                                $count: "count"
                            }],
                            as: "articles"
                        }
                    },
                    {
                        $set: {
                            articles: {
                                $arrayElemAt: ["$articles", 0]
                            }
                        }
                    },
                    {
                        $set: {
                            articleCount: "$articles.count"
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