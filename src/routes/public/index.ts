import { Router } from "express";
import { 
    getArticles,
    response
 } from "../../common";
import { VERSIONS } from "../../db/collections";
import { find } from "../../db";
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

router.get("/version", async (req, res, next) => {
    try {
        let ret = await find(VERSIONS, {}, {sort: {createTime: -1}}).toArray();
        response(res, 0, ret);
    } catch (err) {
        next(err);
    }
});

export default router;