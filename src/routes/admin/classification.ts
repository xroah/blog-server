import { Router } from "express";
import { insert, find } from "../../db";
import { response } from "../../util";

const router = Router();

router.route("/classification").get(async (req, res) => {
    let ret;
    try {
        ret = await find("classifications").toArray();
    } catch (error) {
        response(res, 500, error, error.message);
        return;
    }
    response(res, 0, ret);
});

export default router;