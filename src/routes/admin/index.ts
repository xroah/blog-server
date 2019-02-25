import articleRouter from "./article";
import { Router } from "express";

const apiRouter = Router();

apiRouter.use("/articles", articleRouter);

export default apiRouter;