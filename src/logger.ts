import log4js from "log4js";

log4js.configure({
    appenders: {
        log: {
            type: "dateFile",
            filename: "/tmp/blog-server/log",
            pattern: "yyyy-MM-dd.log",
            compress: true,
            alwaysIncludePattern: true
        },
        console: {
            type: "console"
        }
    },
    categories: {
        default: {
            appenders: ["log"],
            level: "debug"
        },
        console: {
            appenders: ["console"],
            level: "debug"
        }
    }
});

const logFile = log4js.getLogger("log");
const logConsole = log4js.getLogger("console");

export default (msg: string) => {
    logFile.debug(msg);
    logConsole.debug(msg);
}