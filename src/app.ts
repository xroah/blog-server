import express from "express";
import admin from "./admin";

const app = express();

app.get("/", (req, res) => {
    res.end("Hello world!");
});

app.use("/api/admin", admin);

export default app;