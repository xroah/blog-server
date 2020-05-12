import express from "express";
import interceptor from "./controllers/interceptor";
import { login } from "./controllers/login";

const app = express();

app.all("*", interceptor);
app.get("/", (req, res) => res.send("Admin"));
app.post("/login", login);

export default app;