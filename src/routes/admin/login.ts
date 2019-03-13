import { Router, NextFunction } from "express";
import { findOne, update } from "../../db";
import { md5 } from "../../util";
import { response } from "../../common";

const router = Router();

async function userExists(username: string, password: string, next: NextFunction) {
    try {
        let ret = await findOne("users", {
            username,
            password: md5(password)
        }, {
            projection: {
                _id: 1
            }
        });
        return ret;
    } catch (err) {
        next(err);
        return "error";
    }
}

router.route("/login").post(async (req, res, next) => {
    let body: any = req.body;
    let s: any = req.session;
    let ret = await userExists(body.username, body.password, next);
    if (ret) {
        if (ret === "error") return;
        s.isAdmin = true;
        s.username = body.username;
        response(res, 0, null, "登录成功!");
    } else {
        response(res, 404, null, "用户名或密码错误!");
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
    let body = req.body;
    let s:any = req.session;
    let ret = await userExists(s.username, body.origPwd, next);
    if (ret) {
        if (ret === "error") return;
        try {
            await update("users", {
                _id: ret._id
            }, {
                $set: {
                    password: md5(body.newPwd)
                }
            });
            response(res, 0, null);
        } catch (err) {
           next(err);
        }
    } else {
        response(res, 404, null, "原密码错误");
    }
});

export default router;