import express from "express";
import session from "express-session";
import redis from "redis";
import store from "connect-redis";
import { join } from "path";
import user from "./user";
import admin from "./admin";
import nonMatch from "./common/controllers/nonMatch"

export default function createApp() {
    const app = express();
    const RedisStore = store(session);

    app.use(express.static(join(__dirname, "../static")));
    express.json();
    express.urlencoded();
    express.text();
    app.use(
        session({
            store: new RedisStore({ client: redis.createClient() }),
            secret: "blog",
            rolling: true,
            resave: false,
            cookie: {
                httpOnly: true,
                maxAge: 30 * 60 * 1000
            }
        })
    );

    app.use("/", user);
    app.use("/admin", admin);
    app.use(nonMatch);

    return app;
}