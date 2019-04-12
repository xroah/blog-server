import {
    Request,
    Response,
    NextFunction
} from "express";
import { ObjectID } from "mongodb";
import { find } from "../db";
import { response } from "../common";
import { RESOURCES } from "../db/collections";

export default async function getImages(req: Request, res: Response, next: NextFunction) {
    let {
        query: { albumId }
    } = req;
    try {
        if (albumId == 1 || albumId == 2) {
            albumId = +albumId;
        } else {
            albumId = new ObjectID(albumId);
        }
        let ret = await find(
            RESOURCES,
            { albumId },
            {
                sort: {
                    createTime: -1
                }
            }
        ).toArray();
        response(res, 0, ret);
    } catch (err) {
        next(err);
    }
}