import { Router } from "express";
import { findOne } from "../../db";
import { md5, response } from "../../util";

const router = Router();

router.route("/login").post(async (req, res) => {
    let body: any = req.body;
    let s: any = req.session;
    let ret = await findOne("users", {
        username: body.username,
        password: md5(body.password)
    });
    if (ret) {
        s.isAdmin = true;
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

export default router;