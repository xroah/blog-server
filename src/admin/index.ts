import express from "express";
import interceptor from "./controllers/interceptor";

const app = express();

app.all("*", interceptor);

export default app;