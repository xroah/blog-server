import http, { ClientRequestArgs } from "http";
import https from "https";

export default function request(isHttps?: boolean, opt: ClientRequestArgs = {}) {
    let _request = isHttps ? https.request : http.request;
    return new Promise((resolve, reject) => {
        let req = _request(opt, res => {
            let buffer = Buffer.allocUnsafe(0);
            res.on("end", function () {
                resolve(buffer);
            });

            res.on("data", chunk => {
                buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length);
            });
        });

        req.on("error", err => {
            reject(err);
        });
        req.end();
    });
}