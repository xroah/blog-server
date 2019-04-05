import articleRouter from "./article";
import { Router } from "express";
import clsRouter from "./classification";
import loginRouter from "./login";
import uploadRouter from "./fileUpload";
import comment from "./comment";
import album from "./album";

const adminRouter = Router();

adminRouter.use(articleRouter);
adminRouter.use(clsRouter);
adminRouter.use(loginRouter);
adminRouter.use(uploadRouter);
adminRouter.use(comment);
adminRouter.use(album);

export default adminRouter;