import express from "express";
import apiRouter from "./routes/admin"

const admin = express();

admin.use(apiRouter);

export default admin;