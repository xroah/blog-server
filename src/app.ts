import express from "express"
import session from "express-session"
import store from "connect-redis"
import cookieParser from "cookie-parser"
import { join } from "path"
import user from "./public"
import admin from "./admin"
import nonMatch from "./common/controllers/nonMatch"
import handleError from "./common/controllers/handleError"
import { redisClient } from "./db"
import { SESSION_KEY } from "./config"
import logger, {DIVIDER} from "./common/logger"

export default function createApp() {
    const app = express()
    const RedisStore = store(session)
    app.use(express.static(join(__dirname, "../static")))
    app.use(express.json())
    app.use(express.urlencoded({
        extended: true
    }))
    app.use(express.text())
    app.use(cookieParser())
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
    )
    app.use((req, _, next) => {
        const body = JSON.stringify(req.body)

        logger.debug("request method", req.method)
        logger.debug("request url", req.url)
        logger.debug("request body", body)
        logger.info("", DIVIDER)

        next()
    })

    app.use("/api", user)
    app.use("/api/admin", admin)
    app.use(nonMatch)
    app.use(handleError)

    return app
}