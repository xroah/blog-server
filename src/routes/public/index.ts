import { Router } from "express";
import { getArticles } from "../../common";
import fetchPic from "./fetchBingPic";

const router = Router();

router.get("/articles/list/:id?", getArticles);
router.use(fetchPic);

export default router;