import { Router } from "express";
import { getArticles } from "../../common";
import fetchPic from "./fetchBingPic";
import comment from "./comment";

const router = Router();

router.get("/articles/list/:id?", getArticles);
router.use(fetchPic);
router.use(comment);

export default router;