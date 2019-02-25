import { Router } from "express";
import { getArticles } from "../../common";

const router = Router();

router.get("/articles/list/:id?", getArticles);

export default router;