import articleRouter from "./article";
import { Router } from "express";
import { VERSIONS } from "../../db/collections";
import { insert } from "../../db";
import { response } from "../../common";
import clsRouter from "./classification";
import loginRouter from "./login";
import uploadRouter from "./fileUpload";
import comment from "./comment";
import album from "./album";
import image from "./albumImage";
import stats from "./stats";

const adminRouter = Router();

adminRouter.use(articleRouter);
adminRouter.use(clsRouter);
adminRouter.use(loginRouter);
adminRouter.use(uploadRouter);
adminRouter.use(comment);
adminRouter.use(album);
adminRouter.use(image);
adminRouter.use(stats);

adminRouter.post("/version", async (req, res, next) => {
    let {
        version,
        content
    } = req.body;
    try {
        let ret = await insert(VERSIONS, {
            createTime: new Date(),
            version,
            content
        });
        response(res, 0, ret);
    } catch (err) {
        next(err);
    }
});

export default adminRouter;