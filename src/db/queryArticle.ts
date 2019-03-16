import {Db, Collection, ObjectID} from "mongodb";
import config from "../config";

export interface Options {
    page?: number;
    keywords?: string;
    id?: string;
    projection?: Object;
    secret?: boolean
}

export default function (db: Db, c: string, options: Options) {
    let collection: Collection = db.collection(c);
    let {page = 1, keywords, id, projection, secret} = options;
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
    }, {
        $addFields: {
            clsName: "$cls.name",
        }
    }, {
        $project: Object.assign({}, projection, {cls: 0})

    }];
    let $match: any = {};
    let promises: Array<any> = [];
    if (secret !== undefined) {
        $match.secret = secret;
    }
    if (id) {
        $match._id = new ObjectID(id);
    } else {
        if (keywords) {
            $match.content = new RegExp(keywords, "i");
        }
        pipeline.splice(
            1,
            0,
            {
                $skip: (page - 1) * config.PAGE_SIZE
            },
            {
                $limit: 10
            },
            {
                $sort: {
                    createTime: -1
                }
            }
        );
        promises.push(collection.countDocuments($match));
    }
    pipeline.unshift({$match});
    promises.unshift(collection.aggregate(pipeline).toArray());
    return Promise.all(promises);
}