import express, { query } from "express";
import fetchBingPic from "./controllers/fetchBingPic";
import { queryArticle } from "../common/controllers/article";

const app = express();

app.get("/", (req, res) => {
    res.send("Hello world!");
});
app.get("/bg", fetchBingPic);
app.get("/articles", queryArticle);

export default app;