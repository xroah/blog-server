import {Router, Request, Response} from "express";
import {
    find,
    findOneAndUpdate,
    deleteOne,
    findOne
} from "../../db";
import {response} from "../../util";
import {ObjectID} from "mongodb";

const router = Router();

const COLLEC = "classifications";

async function exists(name: string) {
    try {
        let ret = await findOne(COLLEC, {
            name
        }, {
            projection: {
                _id: 0,
                name: 0,
                createTime: 0
            }
        });
        return !!ret;
    } catch (err) {
        return false;
    }
}

async function update(req: Request, res: Response) {
    let body = req.body;
    let ret;
    let isExists = await exists(body.name);
    if (!body.id && isExists) {
        return response(res, 1, null, "分类已存在!");
    }
    try {
        ret = await findOneAndUpdate(COLLEC, {
            _id: new ObjectID(body.id)
        }, {
            $set: {
                name: body.name
            }
        }, {
            upsert: true
        })
    } catch (err) {
        return response(res, 500, null, err.message);
    }
    response(res, 0, ret);
}

router.route("/classification").get(async (req, res) => {
    let ret;
    try {
        ret = await find(COLLEC).toArray();
    } catch (error) {
        response(res, 500, error, error.message);
        return;
    }
    response(res, 0, ret);
}).post(update)
    .put(update)
    .delete(async (req, res) => {
        let body = req.query;
        let ret;
        try {
            ret = await deleteOne(COLLEC, {
                _id: new ObjectID(body.id)
            });
        } catch (err) {
            return response(res, 500, null, err.message);
        }
        response(res, 0, ret);
    });

export default router;