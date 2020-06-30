import express from "express";
import session from "express-session";
import store from "connect-redis";
import cookieParser from "cookie-parser";
import { join } from "path";
import user from "./public";
import admin from "./admin";
import nonMatch from "./common/controllers/nonMatch"
import handleError from "./common/controllers/handleError";
import { redisClient } from "./db";
import { SESSION_KEY } from "./config";

export default function createApp() {
    const app = express();
    const RedisStore = store(session);
    
    app.use(express.static(join(__dirname, "../static")));
    app.use(express.json());
    app.use(express.urlencoded({
        extended: true
    }));
    app.use(express.text());
    app.use(cookieParser());
    app.use(
        session({
            store: new RedisStore({ client: redisClient }),
            secret: SESSION_KEY,
            rolling: true,
            resave: true,
            saveUninitialized: true,
            cookie: {
                httpOnly: true,
                maxAge: 30 * 60 * 1000
            }
        })
    );
    app.use("/api", user);
    app.use("/api/admin", admin);
    app.use(nonMatch);
    app.use(handleError);

    return app;
}