import {
    Router
} from "express";
import {
    getImages,
    response
} from "../../common";
import {ObjectID} from "mongodb";
import {
    del,
    find,
    findOneAndUpdate
} from "../../db";
import {delFiles} from "../../util";
import {RESOURCES} from "../../db/collections";

const router = Router();

router.route("/image")
    .get(getImages)
    .delete(async (req, res, next) => {
        let {id} = req.body;
        if (!Array.isArray(id)) {
            id = [id];
        }
        try {
            id = id.map((_id: any) => new ObjectID(_id));
            let ret = await find(
                RESOURCES,
                {
                    _id: {
                        $in: id
                    }
                },
                {
                    projection: {
                        _id: 1,
                        path: 1
                    }
                }).toArray();
            if (ret.length) {
                ret = ret.map((item: any) => item.path);
                await del(
                    RESOURCES,
                    {
                        _id: {
                            $in: id
                        }
                    },
                    {
                        many: true
                    }
                );
                delFiles(ret);
            }
            response(res, 0);
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