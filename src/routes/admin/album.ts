import {
    Router,
    Response,
    Request,
    NextFunction
} from "express";
import {
    getAlbums,
    response
} from "../../common";
import {
    findOne,
    findOneAndUpdate,
    del
} from "../../db";
import {ObjectID} from "mongodb";

const router = Router();

async function beforeSave(req: Request, res: Response, next: NextFunction) {
    let {
        id,
        name
    } = req.body;
    let exist;
    try {
        exist = await findOne("albums", {name});
        if (exist && exist._id.toString() !== id) {
            return next(new Error("相册已存在"));
        }
        next();
    } catch (err) {
        next(err);
    }
}

async function save(req: Request, res: Response, next: NextFunction) {
    let {
        id,
        name,
        desc,
        secret
    } = req.body;
    if (!name.trim()) {
        return next(new Error("没有name"));
    }
    let $set: any =  {
        name,
        desc,
        secret: !!secret
    };
    try {
        if (id) {
            if (id == 1 || id == 2) {
                id = +id;
            } else {
                id = new ObjectID(id);
            }
        } else {
            id = new ObjectID();
            $set.createTime = new Date();
        }
        let ret = await findOneAndUpdate(
            "albums",
            {
                _id: id
            },
            {
                $set
            },
            {
                upsert: true
            });
        response(res, 0, ret);
    } catch (err) {
        next(err);
    }
}

async function beforeDel(req: Request, res: Response, next: NextFunction) {
    let {
        id
    } = req.body;
    if (id == 1 || id == 2) {
        return next(new Error("不能删除!"));
    }
    try {
        let ret = await findOne("resources", {
            album: new ObjectID(id)
        });
        if (ret) {
            return next(new Error("该相册下有照片,不能删除!"));
        }
        next();
    } catch (err) {
        next(err);
    }
}

async function delAlbum(req: Request, res: Response, next: NextFunction) {
    let {
        id
    } = req.body;
    try {
        let ret = await del("albums", {
            _id: new ObjectID(id)
        });
        response(res, 0, ret);
    } catch (err) {
        next(err);
    }
}


router.route("/album")
    .get(getAlbums)
    .post(beforeSave, save)
    .put(beforeSave, save)
    .delete(beforeDel, delAlbum);

export default router;