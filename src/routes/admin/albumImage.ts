import {
    Router
} from "express";
import {
    getImages,
    response
} from "../../common";
import {ObjectID} from "mongodb";
import {
    findOneAndDelete,
    findOneAndUpdate
} from "../../db";
import { unlink } from "fs";
import { RESOURCES } from "../../db/collections";

const router = Router();

router.route("/image")
    .get(getImages)
    .delete(async (req, res, next) => {
        let {id} = req.body;
        try {
            let ret: any = await findOneAndDelete(RESOURCES, {
                _id: new ObjectID(id)
            });
            if (ret && ret.value) {
                unlink(ret.value.path, e => e);
            }
            response(res, 0, ret);
        } catch (err) {
            next(err);
        }
    }).put(async (req, res, next) => {
    let {
        name,
        id
    } = req.body;
    if (!name) {
        return next(new Error("name不能为空"));
    }
    try {
        let ret = await findOneAndUpdate(
            RESOURCES,
            {
                _id: new ObjectID(id)
            },
            {
                $set: {
                    name
                }
            });
        response(res, 0, ret);
    } catch (err) {
        next(err);
    }
});

export default router;