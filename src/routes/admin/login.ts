import {
    Router,
    NextFunction
} from "express";
import {
    findOne,
    findOneAndUpdate
} from "../../db";
import { md5 } from "../../util";
import { response } from "../../common";

const router = Router();

router.route("/login").post(async (req, res, next) => {
    let body: any = req.body;
    let s: any = req.session;
    let ret;
    try {
        ret = await findOne("users", {
            username: body.username,
            password: md5(body.password)
        }, {
                projection: {
                    _id: 0
                }
            });
    } catch (err) {
        return next(err);
    }
    if (ret) {
        s.isAdmin = true;
        s.username = body.username;
        response(res, 0, null, "登录成功!");
    } else {
        response(res, 1, null, "用户名或密码错误!");
    }
}).delete((req, res) => {
    let s: any = req.session;
    s.destroy();
    delete s.isAdmin;
    response(res, 0, null);
});

/**
 * @param {origPwd} 原密码
 * @param {newPwd} 新密码
 */
router.post("/modifyPwd", async (req, res, next) => {
    let {
        origPwd,
        newPwd
    } = req.body;
    let { username } = <any>req.session;
    let ret;
    try {
        ret = await findOneAndUpdate(
            "users",
            {
                username,
                password: md5(origPwd)
            },
            {
                $set: {
                    password: md5(newPwd)
                }
            }
        );
    } catch (err) {
        return next(err);
    }
    if (ret.value) {
        response(res, 0, null);
    } else {
        response(res, 1, null, "原密码错误");
    }
});

export default router;