import log4js, { Logger } from "log4js"

const isDev = process.env.NODE_ENV === "development"
export const DIVIDER = "================================"

const cfg: any = {
    appenders: {
        console: {
            type: "stdout",
            layout: {
                type: "coloured"
            }
        }
    },
    categories: {
        default: {
            appenders: ["console"],
            level: "debug"
        }
    }
}

let logger: Logger

if (isDev) {
    log4js.configure(cfg);

    logger = log4js.getLogger()
} else {
    cfg.appenders.file = {
        type: "dateFile",
        filename: "/var/log/blog-log",
        compress: true,
        daysToKeep: 30,
        pattern: "yyyy-MM-dd.log",
        alwaysIncludePattern: true
    }
    cfg.categories.file = {
        appenders: ["file"],
        level: "debug"
    }

    log4js.configure(cfg)

    logger = log4js.getLogger("file")
}

export default logger