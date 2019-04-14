import config from "./config";
import app from "./app";
import http from "http";
import {connect} from "./db";
import {fork} from "child_process";

connect(() => {
    http.createServer(app).listen(config.port);
});

const CHILD_PATH = `${__dirname}/schedule`;

let child = fork(CHILD_PATH);

child.on("exit", () => {
    child = fork(CHILD_PATH);
});