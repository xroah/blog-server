import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import session from "express-session";
import connectRedis from "connect-redis";
import admin from "./admin";
import publicRouter from "./routes/public";
import log from "./logger";
import { response } from "./common";
import { resolve } from "path";
import config from "./config";

const app = express();
const RedisStore = connectRedis(session);

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
    let query = JSON.stringify(req.query);
    let body = JSON.stringify(req.body);
    let headers = JSON.stringify(req.headers);
    log(`Request: method: ${req.method}, url: ${req.url}, headers: ${headers} query: ${query}, body: ${body}`);
    next();
});

if (process.env.NODE_ENV === "development") {
    let dir = resolve(`${config.uploadBaseDir}${config.uploadDir}`);
    let p = new RegExp(`\/*${config.uploadDir}`)
    app.use(p, express.static(dir));
}

app.use("/api/xsys", admin);

app.use("/api", publicRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    log(`Error: ${req.method}, ${req.url}, ${err.stack}`);
    response(res, 500, null, err.message);
});

export default app;