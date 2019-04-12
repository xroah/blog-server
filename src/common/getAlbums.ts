import { aggregate } from "../db";
import {
    Request,
    Response,
    NextFunction
} from "express";
import response from "./response";
import handleAlbumId from "./handleAlbumId";
import { 
    ALBUMS,
    RESOURCES
 } from "../db/collections";

export default async function getAlbums(req: Request, res: Response, next: NextFunction) {
    let {
        originalUrl,
        query: { id }
    } = req;
    const isAdmin = !originalUrl.startsWith("/api/album");
    let query: any = {};
    let pipeline: Array<Object> = [];
    if (!isAdmin) {
        query.secret = false;
    }
    pipeline.push({
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
            $lookup: {
                from: RESOURCES,
                let: {
                    cover: "$cover"
                },
                pipeline: [{
                    $project: {
                        _id: 1,
                        relPath: 1,
                    }
                }, {
                    $match: {
                        $expr: {
                            $eq: ["$$cover", "$_id"]
                        }
                    }
                }, {
                    $limit: 1
                }],
                as: "c"
            }
        }, {
            $addFields: {
                images: {
                    $arrayElemAt: ["$r", 0]
                },
                coverInfo: {
                    $arrayElemAt: ["$c", 0]
                }
            }
        }, {
            $project: {
                r: 0,
                cover: 0,
                c: 0
            }
        });
    try {
        if (id) {
            id = handleAlbumId(id);
            query._id = id;
            pipeline.unshift({
                $limit: 1
            });
        }
        pipeline.unshift({
            $match: query
        });
        let albums = await aggregate(ALBUMS, pipeline).toArray();
        response(res, 0, id ? albums[0] : albums);
    } catch (err) {
        next(err);
    }
}