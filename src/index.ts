import { PORT } from "./config";
import express from "express";
import createApp from "./app";
import { connectDb } from "./db";
import {fork} from "child_process";
import { join } from "path";

connectDb(() => {
    createApp().listen(PORT);
});

fork(join(__dirname, "./schedule.ts"));