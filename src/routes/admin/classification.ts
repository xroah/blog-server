import {
    Router,
    Request,
    Response,
    NextFunction
} from "express";
import {
    find,
    findOneAndUpdate,
    del,
    findOne
} from "../../db";
import {response} from "../../common";
import {ObjectID} from "mongodb";

const router = Router();

const COLLEC = "classifications";

function exists(name: string) {
    return findOne(COLLEC, {
        name
    }, {
        projection: {
            _id: 1
        }
    });
}

async function get(req: Request, res: Response, next: NextFunction) {
    let ret;
    try {
        ret = await find(COLLEC, {}, {sort: {createTime: -1}}).toArray();
    } catch (err) {
        return next(err);
    }
    response(res, 0, ret);
}

async function beforeUpdate(req: Request, res: Response, next: NextFunction) {
    let {id, name} = req.body;
    //先检查是否有同名的分类
    let isExists;
    try {
        isExists = await exists(name);
        console.log(">>>>>>>>>>>>>>>>>>>>>>", isExists)
    } catch (err) {
        return next(err);
    }
    if (isExists) {
        let _id = isExists._id.toString(); // cast ObjectID to string
        if ((id && id !== _id) || !id) {
            return response(res, 1, null, "分类已存在!");
        }
    }
    next();
}

async function update(req: Request, res: Response, next: NextFunction) {
    let {id, name} = req.body;
    let ret;
    if (req.method.toLowerCase() === "put" && !id) {
        return next(new Error("没有传id"));
    }
    let $set: any = {
        name
    };
    if (!id) {
        $set.createTime = new Date();
    }
    try {
        ret = await findOneAndUpdate(COLLEC, {
            _id: new ObjectID(id)
        }, {
            $set
        }, {
            upsert: !id
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

async function deleteCls(req: Request, res: Response, next: NextFunction) {
    let _id = new ObjectID(req.body.id);
    let ret;
    try {
        ret = await del(COLLEC, {
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
    .delete(beforeDel, deleteCls);

export default router;