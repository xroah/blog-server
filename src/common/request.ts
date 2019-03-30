import http, { ClientRequestArgs } from "http";
import https from "https";
import EventEmitter from "events";

export const reqEmitter = new EventEmitter();

export default function request(isHttps?: boolean, opt: ClientRequestArgs = {}) {
    let _request = isHttps ? https.request : http.request;
    return new Promise((resolve, reject) => {
        let req = _request(opt, res => {
            let buffer = Buffer.allocUnsafe(0);
            res.on("end", function () {
                resolve(buffer);
                reqEmitter.emit("end", buffer);
            });

            res.on("data", chunk => {
                buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length);
                reqEmitter.emit("data", chunk);
            });
        });

        req.on("error", err => {
            reject(err);
            reqEmitter.emit("error", err);
        });
        req.end();
    });
}