import express from "express"
import createApp from "./app"
import {connectDb} from "./db"
import {fork} from "child_process"
import {join} from "path"
import logger, {DIVIDER} from "./common/logger"

declare global {
  namespace Express {
    interface Response {
      json2: (code: number, data?: any, logData?: boolean) => this
      error: (code: number, msg: string, status?: number, data?: any) => this
    }
  }
}

express.response.error = function (code: number, msg: string, status = 200, data) {
  const obj = {
    code,
    msg,
    data
  }

  logger.error("error status", status)
  logger.error("error message", JSON.stringify(obj))
  logger.info("", DIVIDER)

  this.status(status)
  this.json(obj)

  return this
}

express.response.json2 = function json2(
  code: number,
  data?: any,
  logData = true
) {
  const obj = {
    code,
    data
  }

  logger.debug("response json", JSON.stringify(
    logData ? obj : {code}
  ))
  logger.info("", DIVIDER)

  this.json(obj)

  return this
}

connectDb(() => {
  createApp().listen(process.env.BLOG_PORT || 8000)
})

fork(join(__dirname, "./schedule.ts"))