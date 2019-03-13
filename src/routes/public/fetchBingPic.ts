import https from "https";
import { Router } from "express";
import { response } from "../../common";

let router = Router();

function fetchPic() {
    return new Promise((resolve, reject) => {
        let req = https.request({
            hostname: "cn.bing.com",
            path: "/HPImageArchive.aspx?format=js&idx=0&n=1"
        }, res => {
            let str = "";
            res.on("end", function () {
                resolve(JSON.parse(str));
            });

            res.on("data", chunk => {
                str += chunk;
            });
        });

        req.on("error", err => {
            reject(err);
        });
        req.end();
    });
}

function handleReq(data: any) {
    let img = data.images[0];
    let url = img.url;
    let hostname = "cn.bing.com";
    let _path;
    if (!url.startsWith("https:")) {
        _path = url;
    } else {
        url = new URL(url);
        _path = url.pathname
    }
    return {
        url: `//${hostname}/${_path}`,
        copyright: img.copyright
    };
}

router.get("/fetchBingPic", async (req, res, next) => {
    let data;
    try {
       data = await fetchPic(); 
    } catch (err) {
        return next(err);
    }
    let img = handleReq(data); 
    response(res, 0, img);
});
export default router;