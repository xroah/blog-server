import { Router } from "express";
import { request } from "http";
import { response } from "../../common";

const router = Router();

function fetchInfo() {
    return new Promise((resolve, reject) => {
        let ret = "";
        let req = request({
            host: "open.iciba.com",
            path: "/dsapi/"
        }, res => {
            res.on("data", chunk => {
                ret += chunk;
            });
            res.on("end", () => resolve(JSON.parse(ret)));
        });
        req.end();
        req.on("error", reject);

    });
}

router.get("/dailySentence", async (req, res, next) => {
    try {
        let ret = await fetchInfo();
        response(res, 0, ret);
    } catch (err) {
        next(err);
    }
});

export default router;