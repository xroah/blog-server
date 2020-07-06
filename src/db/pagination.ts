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
    pipeline: any[],
    matches: any[] = []
) {
    const PAGE_SIZE = 10;
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
        let $match: any = [...matches];
        let countFilter: any;
        let sort = -1;

        //descending sort
        //prioritize after query
        if (after) {
            countFilter = {
                _id: {
                    $lt: new ObjectId(after)
                }
            };
        } else if (before) {
            countFilter = {
                _id: {
                    $gt: new ObjectId(before)
                }
            };
            sort = 1;
        }

        if (countFilter) {
            $match.push(countFilter);
        }

        if ($match.length > 1) {
            $match = {
                $and: $match
            }
        } else {
            $match = $match[0];
        }
        
        count = await _collection.countDocuments($match || {}, {});
        let _pipeline = [
            {
                $sort: {
                    _id: sort
                }
            },
            {
                $limit: pageSize
            },
            ...pipeline
        ];

        $match && _pipeline.unshift({ $match });

        ret = await _collection
            .aggregate(_pipeline)
            .sort({ _id: -1 })
            .toArray()
    } catch (error) {
        return next(error);
    }

    res.json({
        code: 0,
        data: {
            list: ret,
            hasMore: count > pageSize
        }
    });
}