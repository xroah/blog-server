import express from "express";
import fetchBingPic from "./controllers/fetchBingPic";
import nonMatch from "../common/controllers/nonMatch";

const app = express();

app.get("/", (req, res) => {
    res.send("Hello world!");
});
app.get("/bg", fetchBingPic);

export default app;