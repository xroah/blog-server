import {
    Request,
    Response,
    NextFunction
} from "express";
import { ObjectId } from "mongodb";
import { db } from ".";

export default async function pagination(
    req: Request,
    res: Response,
    next: NextFunction,
    collection: string,
    pipeline: any[]
) {
    const PAGE_SIZE = 30;
    const _collection = db.collection(collection);
    let {
        before,
        after,
        pageSize
    } = req.query as any;
    let count = 0;
    let ret;
    pageSize = Number(pageSize) || PAGE_SIZE;

    if (pageSize < 0) pageSize = PAGE_SIZE;

    try {
        const _pipeline = [];
        let countFilter: any;
        let sort = 1;

        //descending sort
        //prioritize after query
        if (after) {
            countFilter = {
                _id: {
                    $lt: new ObjectId(after)
                }
            };
            sort = -1;
        } else if (before) {
            countFilter = {
                _id: {
                    $gt: new ObjectId(before)
                }
            };
        }

        if (countFilter) {
            _pipeline.push({
                $match: countFilter
            });
        }

        count = await _collection.countDocuments(countFilter || {}, {});
        ret = await _collection.aggregate([
            ..._pipeline,
            {
                $sort: {
                    _id: sort
                }
            },
            {
                $limit: PAGE_SIZE
            },
            ...pipeline
        ])
            .sort({ _id: -1 })
            .toArray()
    } catch (error) {
        return next(error);
    }

    res.json({
        code: 0,
        data: {
            list: ret,
            hasMore: count > PAGE_SIZE
        }
    });
}