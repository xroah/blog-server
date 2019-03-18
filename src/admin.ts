import express from "express";
import apiRouter from "./routes/admin"
import { response } from "./common";

const admin = express();

admin.all("*", (req, res, next) => {
    let s: any = req.session;
    if (req.url !== "/login" && !s.isAdmin) {
        return response(res, 403, null, "对不起，您没有权限！");
    }
    next();
});

admin.use(apiRouter);

export default admin;