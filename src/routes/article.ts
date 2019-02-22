import { Router } from "express";
import { response } from "../util";
import { queryArticle } from "../db";

const router = Router();

router.route("/list/:id?").get(async (req, res) => {
    let { query } = req;
    let secret = false;
    let id = req.params.id;
    let {page, keywords} = query;
    let projection: Object = {
        secret: 0
    };
    if (!id) {
        projection = {
            content: 0
        };
    }
    let [list, total] = await queryArticle("article", {
        page, 
        keywords,
        secret,
        id,
        projection
    });
    let data = {};
    if (id) {
        data = list[0];
    } else {
        data = {
            list,
            total
        };
    }
    response(res, 0, data);
});

export default router;
