import { PORT } from "./config";
import express from "express";
import createApp from "./app";
import { connectDb } from "./db";
import {fork} from "child_process";
import { join } from "path";
import logger from "./common/logger";
declare global {
  namespace Express {
    interface Response {
      json2: (code: number, data?: any) => this;
      error: (code: number, msg: string, status?: number, data?: any) => this;
    }
  }
}

express.response.error = function(code: number, msg: string, status = 200, data) {
    const obj = {
        code,
        msg,
        data
    };

    logger.debug("error status:", status);
    logger.debug("response error:", JSON.stringify(obj));

    this.status(status);
    this.json(obj);

    return this;
}

express.response.json2 = function json2(code: number, data?: any) {
    const obj = {
        code,
        data
    };

    this.json(obj);
    logger.debug("response json:", JSON.stringify(obj));
    return this;
}

connectDb(() => {
    createApp().listen(PORT);
});

fork(join(__dirname, "./schedule.ts"));