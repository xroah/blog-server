import { Router, Request, Response } from "express";
import {
    find,
    findOneAndUpdate,
    deleteOne,
    findOne
} from "../../db";
import { response } from "../../util";
import { ObjectID } from "mongodb";

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
        return err;
    }
}

async function update(req: Request, res: Response) {
    let body = req.body;
    let ret;
    //新增,先检查分类是否存在
    if (!body.id) {
        let isExists = await exists(body.name);
        //报错
        if (isExists.message) {
             return response(res, 500, null, isExists.message);
        }
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
        let _id = new ObjectID(body.id);
        let articles;
        try {
            articles = await findOne("articles", {
                clsId: _id
            }, {
                projection: {
                    _id: 1
                }
            });
        } catch (error) {}
        if (articles) {
            response(res, 1, null, "该分类下有文章,不能删除!");
        }
        let ret;
        try {
            ret = await deleteOne(COLLEC, {
                _id
            });
        } catch (err) {
            return response(res, 500, null, err.message);
        }
        response(res, 0, ret);
    });

export default router;