import { Db, Collection, ObjectID } from "mongodb";
import config from "../config";

export interface Options {
    page?: number;
    keywords?: string;
    id?: string;
    projection?: Object;
    secret?: boolean,
    comment?: boolean;
}

export default function (db: Db, c: string, options: Options) {
    let collection: Collection = db.collection(c);
    let {
        page = 1,
        keywords,
        id,
        projection,
        secret,
        comment
    } = options;
    let $addFields: any = {
        clsName: "$cls.name",
    };
    let $project: any = {
        ...projection,
        cls: 0
    }
    let $lookup: any = {
        from: "classifications",
        localField: "clsId",
        foreignField: "_id",
        as: "cls"
    };
    let pipeline: Array<Object> = [{
        $lookup
    }, {
        $unwind: "$cls",
    }];
    let $match: any = {};
    let promises: Array<any> = [];
    if (secret !== undefined) {
        $match.secret = secret;
    }
    if (id) {
        if (comment) {
            let $lookupComment = {
                from: "comments",
                localField: "_id",
                foreignField: "articleId",
                as: "comments"
            };
            pipeline.unshift({ $lookup: $lookupComment });
        }
        $match._id = new ObjectID(id);
    } else {
        let queryCommentCount = [{
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "articleId",
                as: "c"
            }
        }];
        let other = [{
            $sort: { createTime: -1 }
        }, {
            $skip: (page - 1) * config.PAGE_SIZE
        },
        {
            $limit: 10
        }];
        $project.c = 0;
        $addFields.comments = {$size: "$c"};
        page = Number(page);
        if (page <= 0 || isNaN(page)) {
            page = 1;
        }
        if (keywords) {
            $match.content = new RegExp(keywords, "i");
        }
        pipeline = [...queryCommentCount, ...pipeline, ...other, { $addFields }, { $project }];
        promises.push(collection.countDocuments($match));
    }
    pipeline.unshift({ $match });
    promises.unshift(collection.aggregate(pipeline).toArray());
    return Promise.all(promises);
}