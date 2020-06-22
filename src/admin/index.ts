import express from "express";
import interceptor from "./controllers/interceptor";
import { login, logout, updatePassword } from "./controllers/login";
import upload from "./controllers/upload";
import {
    saveArticle,
    deleteArticle,
    queryArticle
} from "./controllers/article";
import {
    saveCategory,
    delCategory,
    queryCategory
} from "./controllers/category";
import { queryComments } from "./controllers/comment";

const app = express();

app.all("*", interceptor)
    .post("/login", login)
    .post("/logout", logout)
    .post("/password", updatePassword)
    .post("/upload", upload);

app.route("/article")
    .post(saveArticle)
    .get(queryArticle)
    .delete(deleteArticle);

app.route("/category")
    .post(saveCategory)
    .delete(delCategory)
    .get(queryCategory);

app.route("/comment")
    .get(queryComments);

export default app;