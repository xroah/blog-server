import {Router} from "express";
import {count} from "../../db";
import {
    ARTICLES,
    COMMENTS,
    RESOURCES,
    ALBUMS
} from "../../db/collections";
import {response} from "../../common";

const router = Router();

router.get("/count", async (req, res, next) => {
        try {
            let articleCount = await count(ARTICLES);
            let commentCount = await count(COMMENTS);
            let imageCount = await count(RESOURCES);
            let albumCount = await count(ALBUMS);
            response(res, 0, {
                articleCount,
                commentCount,
                imageCount,
                albumCount
            });
        } catch (err) {
            next(err);
        }
    }
);

export default router;