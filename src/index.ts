import config from "./config";
import app from "./app";
import http from "http";
import https from "https";
import {connect} from "./db";
import { MongoClient, Db } from "mongodb";

connect((client: MongoClient, db: Db) => {
    http.createServer(app).listen(config.port);
});