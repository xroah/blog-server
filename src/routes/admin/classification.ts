import {
    Router,
    Request,
    Response,
    NextFunction
} from "express";
import {
    find,
    findOneAndUpdate,
    deleteOne,
    findOne
} from "../../db";
import { response } from "../../common";
import { ObjectID } from "mongodb";

const router = Router();

const COLLEC = "classifications";

function exists(name: string) {
    return findOne(COLLEC, {
        name
    }, {
            projection: {
                _id: 0,
                name: 0,
                createTime: 0
            }
        });
}

async function get(req: Request, res: Response, next: NextFunction) {
    let ret;
    try {
        ret = await find(COLLEC).toArray();
    } catch (err) {
        return next(err);
    }
    response(res, 0, ret);
}

async function beforeUpdate(req: Request, res: Response, next: NextFunction) {
    let body = req.body;
    //新增,先检查分类是否存在
    if (!body.id) {
        let isExists;
        try {
            isExists = await exists(body.name);
        } catch (err) {
            return next(err);
        }
        if (isExists) {
            return response(res, 1, null, "分类已存在!");
        }
    }
    next();
}

async function update(req: Request, res: Response, next: NextFunction) {
    let body = req.body;
    let ret;
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
        return next(err);
    }
    response(res, 0, ret);
}

async function beforeDel(req: Request, res: Response, next: NextFunction) {
    let _id = new ObjectID(req.body.id);
    let articles;
    try {
        articles = await findOne("articles", {
            clsId: _id
        }, {
                projection: {
                    _id: 1
                }
            });
    } catch (err) {
        return next(err);
    }
    if (articles) {
        return response(res, 1, null, "该分类下有文章,不能删除!");
    }
    next();
}

async function del(req: Request, res: Response, next: NextFunction) {
    let _id = new ObjectID(req.body.id);
    let ret;
    try {
        ret = await deleteOne(COLLEC, {
            _id
        });
    } catch (err) {
        return next(err);
    }
    response(res, 0, ret);
}

router.route("/classification")
    .get(get)
    .post(beforeUpdate, update)
    .put(beforeUpdate, update)
    .delete(beforeDel, del);

export default router;