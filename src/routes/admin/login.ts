import { Router } from "express";
import { findOne, update } from "../../db";
import { md5, response } from "../../util";

const router = Router();

async function userExists(username: string, password: string) {
    try {
        let ret = await findOne("users", {
            username,
            password: md5(password)
        });
        return ret;
    } catch (error) {
        return error;
    }
}

router.route("/login").post(async (req, res) => {
    let body: any = req.body;
    let s: any = req.session;
    let ret = await userExists(body.username, body.password);
    if (ret) {
        if (ret.message) {
            return response(res, 500, null, ret.message);
        }
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
router.post("/modifyPwd", async (req, res) => {
    let body = req.body;
    let s:any = req.session;
    let ret = await userExists(s.username, body.origPwd);
    if (ret) {
        if (ret.message) {
            return response(res, 500, null, ret.message);
        }
        try {
            await update("users", {
                _id: ret._id
            }, {
                $set: {
                    password: md5(body.newPwd)
                }
            });
            response(res, 0, null);
        } catch (error) {
           return response(res, 500, null, error.message); 
        }
    } else {
        response(res, 404, null, "原密码错误");
    }
});

export default router;