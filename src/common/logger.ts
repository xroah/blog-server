import log4js, { Logger } from "log4js"

const isDev = process.env.NODE_ENV === "development"

log4js.configure({
    appenders: {
        file: {
            type: "dateFile",
            filename: "/var/log/blog-log",
            compress: true,
            daysToKeep: 30,
            pattern: "yyyy-MM-dd.log",
            alwaysIncludePattern: true
        },
        console: {
            type: "stdout",
            layout: {
                type: "coloured"
            }
        }
    },
    categories: {
        file: {
            appenders: ["file"],
            level: "debug"
        },
        default: {
            appenders: ["console"],
            level: "debug"
        }
    }
})

let logger: Logger

if (isDev) {
    logger = log4js.getLogger()
} else {
    logger = log4js.getLogger("file")
}

export default logger