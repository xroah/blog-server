import https from "https";
import {
    Request,
    Response,
    NextFunction
} from "express";
import Code from "../../code";

export default function fetchBingPic(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const now = Date.now();
    const p = "/HPImageArchive.aspx";
    const params = [
        "format=js",
        "idx=0",
        "n=1",
        "nc=" + now,
        "pid=hp"
    ];
    const fetchImg = () => {
        const hostname = "cn.bing.com";
        const request = https.request(
            {
                hostname,
                path: `${p}?${params.join("&")}`
            },
            response => {
                let ret = "";

                response.on("data", chunk => ret += chunk);
                response.on("end", () => {
                    const info: any = JSON.parse(ret) || {};
                    const img = info.images[0] || {};

                    res.json2(
                        Code.SUCCESS,
                        {
                            url: `https://${hostname}${img.url}`,
                            copyright: img.copyright
                        }
                    );
                });
            }
        );

        request.on("error", err => next(err));
        request.end();
    };

    fetchImg();
}