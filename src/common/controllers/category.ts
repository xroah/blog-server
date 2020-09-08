import {
    Request,
    Response,
    NextFunction
} from "express"
import { find, db } from "../../db"
import { CATEGORIES, ARTICLES } from "../../db/collections"
import Code from "../../code"

export async function queryCategory(
    req: Request,
    res: Response,
    next: NextFunction
) {
    let ret
    let { queryArticle } = req.query

    try {
        let cursor

        if (queryArticle !== "true") {
            cursor = find(CATEGORIES, {})
        } else {
            cursor = db.collection(CATEGORIES)
                .aggregate([
                    {
                        $lookup: {
                            from: ARTICLES,
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
                ])
        }

        ret = await cursor.sort({ _id: -1 }).toArray()
    } catch (error) {
        return next(error)
    }

    res.json2(Code.SUCCESS, ret)
}