import {aggregate} from "../db";
import {
    Request,
    Response,
    NextFunction
} from "express";
import response from "./response";

export default async function getAlbums(req: Request, res: Response, next: NextFunction) {
    const {
        originalUrl
    } = req;
    const isAdmin = !originalUrl.startsWith("/api/album");
    let collection = "albums";
    let query: any = {};
    let pipeline: Array<Object> = [];
    if (!isAdmin) {
        query.secret = false;
    }
    pipeline.push({
        $match: query
    }, {
        $lookup: {
            from: "resources",
            let: {
                aid: "$_id"
            },
            pipeline: [{
                $match: {
                    $expr: {
                        $eq: ["$$aid", "$albumId"]
                    }
                }
            }, {
                $count: "count"
            }],
            as: "r"
        }
    }, {
        $addFields: {
            images: {
                $arrayElemAt: ["$r", 0]
            }
        }
    }, {
        $project: {
            r: 0
        }
    });
    try {
        let albums = await aggregate(collection, pipeline).toArray();
        response(res, 0, albums);
    } catch (err) {
        next(err);
    }
}