import { Router } from "express";
import { getArticles } from "../../common";
import fetchPic from "./fetchBingPic";
import dailySentence from "./fetchDailySentence";
import updateViewedTime from "./updateViewedTime";
import comment from "./comment";

const router = Router();

router.get("/articles/list/:id?", getArticles);
router.use(fetchPic);
router.use(comment);
router.use(dailySentence);
router.use(updateViewedTime);

export default router;