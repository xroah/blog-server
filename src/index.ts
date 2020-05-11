import {
    PORT,
    DB_NAME,
    DB_URL
} from "./config";
import express from "express";
import { MongoClient } from "mongodb";
import createApp from "./app";

MongoClient.connect(
    DB_URL,
    {
        useUnifiedTopology: true
    },
    (err, client) => {
        if (err) throw err;

        const db = client.db(DB_NAME);

        db.collection("users").find({}).toArray().then(res => {
            console.log(res);
        }).catch(err => {
            console.log(err)
        });

        createApp().listen(PORT);
    }
);

