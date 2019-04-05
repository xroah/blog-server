import { Router } from "express";
import { getArticles } from "../../common";
import fetchPic from "./fetchBingPic";
import dailySentence from "./fetchDailySentence";
import updateViewedTime from "./updateViewedTime";
import comment from "./comment";
import album from "./album";

const router = Router();

router.get("/articles/list/:id?", getArticles);
router.use(fetchPic);
router.use(comment);
router.use(dailySentence);
router.use(updateViewedTime);
router.use(album);

export default router;