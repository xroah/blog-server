import express from "express";
import session from "express-session";
import redis from "redis";
import store from "connect-redis";
import { join } from "path";
import user from "./user";
import admin from "./admin";
import nonMatch from "./common/controllers/nonMatch"
import handleError from "./common/controllers/handleError";

export default function createApp() {
    const app = express();
    const RedisStore = store(session);

    app.use(express.static(join(__dirname, "../static")));
    express.json();
    express.urlencoded({
        extended: true
    });
    express.text();
    app.use(
        session({
            store: new RedisStore({ client: redis.createClient() }),
            secret: "blog",
            rolling: true,
            resave: false,
            saveUninitialized: false,
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