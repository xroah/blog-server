import { Response } from "express";
import log from "../logger";

function response(res: Response, errCode: number, data: Object | null, errMsg?: string) {
    let headers = JSON.stringify(res.getHeaders());
    log(`Response: headers: ${headers}, errCode:${errCode}, data: ${JSON.stringify(data)}, errMsg: ${errMsg}`);
    res.json({
        errCode,
        data,
        errMsg
    });
}


export default response;