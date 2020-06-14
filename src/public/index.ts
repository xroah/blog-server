import express from "express";
import fetchBingPic from "./controllers/fetchBingPic";
import { queryArticle, queryPrevAndAfter } from "../common/controllers/article";
import updateArticleViewedCount from "./controllers/updateArticleViewedCount";

const app = express();

app.get("/", (req, res) => {
    res.send("Hello world!");
});
app.get("/bg", fetchBingPic);
app.get("/articles", queryArticle);
app.get("/prevAndNextArticle", queryPrevAndAfter);
app.post("/updateArticleViewedCount", updateArticleViewedCount);

export default app;