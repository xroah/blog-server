import express from "express";
import { 
    PORT,
    DB_NAME,
    DB_URL
 } from "./config";
import { MongoClient } from "mongodb";

const app = express();

MongoClient.connect(DB_URL, (err, client) => {
    if (err) throw err;

    const db = client.db(DB_NAME);

    db.collection("users").find({}).toArray().then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err)
    });

    app.get("/", (req, res) => {
        res.send("Hello world!");
    });

    app.listen(PORT);
});

