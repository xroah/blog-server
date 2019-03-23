import { Router } from "express";
import { findOneAndUpdate } from "../../db";
import { ObjectID } from "mongodb";
import { response } from "../../common";

const router = Router();

router.post("/updateViewedTime", async (req, res, next) => {
    let { articleId } = req.body;
    try {
        await findOneAndUpdate(
            "articles",
            {
                _id: new ObjectID(articleId)
            },
            {
                $inc: {
                    totalViewed: 1,
                    todayViewed: 1
                }
            }
        );
        response(res, 0);
    } catch (err) {
        next(err);
    }
});

export default router;