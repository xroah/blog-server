import express from "express";
import interceptor from "./controllers/interceptor";
import nonMatch from "../common/controllers/nonMatch"

const app = express();

app.all("*", interceptor);
app.use(nonMatch);

export default app;