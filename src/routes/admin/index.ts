import articleRouter from "./article";
import { Router } from "express";
import clsRouter from "./classification";
import loginRouter from "./login";
import uploadRouter from "./fileUpload";

const apiRouter = Router();

apiRouter.use(articleRouter);
apiRouter.use(clsRouter);
apiRouter.use(loginRouter);
apiRouter.use(uploadRouter);

export default apiRouter;