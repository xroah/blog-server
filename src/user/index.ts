import express from "express";
import fetchBingPic from "./controllers/fetchBingPic";

const app = express();

app.get("/", (req, res) => {
    res.send("Hello world!");
});
app.get("/bg", fetchBingPic);

export default app;