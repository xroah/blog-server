import express from "express";
import fetchBingPic from "./controllers/fetchBingPic";
import { queryArticle, queryPrevAndAfter } from "../common/controllers/article";
import updateArticleViewedCount from "./controllers/updateArticleViewedCount";
import { saveComment, queryCommentsByArticle } from "../common/controllers/comment";
import { saveFeedback } from "./controllers/feedback";

const app = express();

app.get("/", (req, res) => {
    res.send("Hello world!");
});
app.get("/bg", fetchBingPic);
app.get("/articles", queryArticle);
app.get("/prevAndNextArticle", queryPrevAndAfter);
app.post("/updateArticleViewedCount", updateArticleViewedCount);
app.route("/comment")
    .get(queryCommentsByArticle)
    .post(saveComment);
app.post("/feedback", saveFeedback);

export default app;