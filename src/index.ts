import { PORT } from "./config";
import express from "express";
import createApp from "./app";
import { connectDb } from "./db";

connectDb(() => {
    createApp().listen(PORT);
});

