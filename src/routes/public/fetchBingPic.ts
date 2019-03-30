import {Router} from "express";
import {response} from "../../common";
import {request} from "../../common";

let router = Router();

export function fetchPic() {
    return request(true, {
        hostname: "cn.bing.com",
        path: "/HPImageArchive.aspx?format=js&idx=0&n=1"
    });
}

export function parseUrl(data: any) {
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
        host: hostname,
        path: _path,
        url: `//${hostname}/${_path}`,
        copyright: img.copyright
    };
}

router.get("/fetchBingPic", async (req, res, next) => {
    let data;
    try {
        data = await fetchPic();
        data = JSON.parse(data.toString());
    } catch (err) {
        return next(err);
    }
    let img = parseUrl(data);
    response(res, 0, img);
});
export default router;