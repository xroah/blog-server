import {
    Request,
    Response
} from "express"
import { ARTICLES } from "../../db/collections"
import { updateOne } from "../../db"
import { ObjectId } from "mongodb"
import Code from "../../code"

export default async function updateArticleViewedCount(
    req: Request,
    res: Response
) {
    const { articleId } = req.body
    
    try {
        const id = new ObjectId(articleId as any)

        await updateOne(
            ARTICLES,
            {
                _id: id
            },
            {
                $inc: {
                    totalViewed: 1,
                    todayViewed: 1
                }
            }
        )

        res.json2(Code.SUCCESS)
    } catch (error) {

    }
}