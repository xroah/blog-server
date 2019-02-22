import crypto from "crypto";
import { Response } from "express";

    function md5(s: string) {
        return crypto.createHash("md5").update(s).digest("hex");
    }

    function response(res: Response, errCode:number, data: Object, errMsg?: string) {
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