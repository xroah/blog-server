import { Router } from "express";
import {
    aggregate,
    count,
    del
} from "../../db";
import { response } from "../../common";
import { ObjectID } from "mongodb";
import {
    COMMENTS,
    ARTICLES
} from "../../db/collections";

const router = Router();

const PAGE_SIZE = 10;

function queryComments(page: number) {
    let pipeline = [{
        $lookup: {
            from: ARTICLES,
            let: { aid: "$articleId" },
            pipeline: [{
                $match: {
                    $expr: {
                        $eq: ["$$aid", "$_id"]
                    }
                }
            }, {
                $project: {
                    title: 1
                }
            }],
            as: "article"
        }
    }, {
        $unwind: "$article"
    }, {
        $sort: {
            createTime: -1
        }
    }, {
        $skip: (page - 1) * PAGE_SIZE
    }, {
        $limit: PAGE_SIZE
    }];
    return Promise.all([
        aggregate(COMMENTS, pipeline).toArray(),
        count(COMMENTS)
    ]);
}

router.route("/comment")
    .get(async (req, res, next) => {
        let { page } = req.query;
        page = Number(page);
        if (page <= 0 || isNaN(page)) {
            page = 1;
        }
        try {
            let [list, total] = await queryComments(page);
            response(res, 0, {
                total,
                list
            });
        } catch (err) {
            next(err);
        }
    })
    .delete(async (req, res, next) => {
        let { ids } = req.body;
        if (!Array.isArray(ids)) {
            return next(new Error("参数不是数组"));
        }
        try {
            ids = ids.map(id => new ObjectID(id));
            let ret = await del(
                COMMENTS,
                {
                    _id: {
                        $in: ids
                    }
                },
                {
                    many: true
                }
            );
            response(res, 0, ret);
        } catch (err) {
            next(err);
        }
    });

export default router;