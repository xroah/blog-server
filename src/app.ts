import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import connectRedis from "connect-redis";
import admin from "./admin";
import publicRouter from "./routes/public";
import log4js from "log4js";

const app = express();
const RedisStore = connectRedis(session);
const logger = log4js.getLogger("app");
logger.level = "debug";

app.use(session({
    secret: "my_blog",
    rolling: true,
    resave: true,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 30 * 60 * 1000 
    },
    store: new RedisStore({
        host: "localhost",
        port: 6379
    })
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.all("*", (req, res, next) => {
    logger.debug(`method: ${req.method}, url: ${req.url}, params: ${JSON.stringify(req.body)}`);
    next();
});

app.use("/api/admin", admin);

app.use("/api", publicRouter);

export default app;