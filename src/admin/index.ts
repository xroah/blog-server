import express from "express";
import interceptor from "./controllers/interceptor";
import { login, logout } from "./controllers/login";
import upload from "./controllers/upload";
import { saveArticle, deleteArticle } from "./controllers/article";
import {queryArticle} from "../common/controllers/article";

const app = express();

app.all("*", interceptor);
app.post("/login", login);
app.post("/logout", logout);
app.post("/upload", upload);
app.route("/article")
    .post(saveArticle)
    .get(queryArticle)
    .delete(deleteArticle);

export default app;