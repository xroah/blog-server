import articleRouter from "./article";
import { Router } from "express";
import clsRouter from "./classification";
import loginRouter from "./login";

const apiRouter = Router();

apiRouter.use(articleRouter);
apiRouter.use(clsRouter);
apiRouter.use(loginRouter);

export default apiRouter;