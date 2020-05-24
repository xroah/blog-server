import express from "express";
import interceptor from "./controllers/interceptor";
import { login, logout } from "./controllers/login";
import upload from "./controllers/upload";

const app = express();

app.all("*", interceptor);
app.post("/login", login);
app.post("/logout", logout);
app.post("/upload", upload);

export default app;