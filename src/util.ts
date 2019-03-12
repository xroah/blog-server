import crypto from "crypto";
import { Response } from "express";
import log from "./logger";

function md5(s: string) {
    return crypto.createHash("md5").update(s).digest("hex");
}

function response(res: Response, errCode: number, data: Object | null, errMsg?: string) {
    log(`Response: errCode:${errCode}, data: ${JSON.stringify(data)}, errMsg: ${errMsg}`);
    res.json({
        errCode,
        data,
        errMsg
    });
}

export {
    md5,
    response
};