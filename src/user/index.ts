import express from "express";
import nonMatch from "../common/controllers/nonMatch";

const app = express();

app.get("/", (req, res) => {
    res.send("Hello world!");
});

export default app;