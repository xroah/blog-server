import articleRouter from "./article";
import { Router } from "express";
import { findOne } from "../../db";
import { md5, response } from "../../util";

const apiRouter = Router();

apiRouter.use("/articles", articleRouter);
apiRouter.post("/login", async (req, res) => {
    let body: any = req.body;
    let s: any = req.session;
    let ret = await findOne("users", {
        username: body.username,
        password: md5(body.password)
    });
    if (ret) {
        s.isAdmin = true;
        response(res, 0, "登录成功!");
    } else {
        response(res, 404, "用户名或密码错误!");
    }
});

export default apiRouter;