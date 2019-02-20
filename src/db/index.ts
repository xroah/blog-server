import { MongoClient } from "mongodb";
import config from "../config";

let db;

function connect(callback: Function) {
    MongoClient.connect(config.devDbURL, {
        useNewUrlParser: true
    }, (err, client) => {
        if (err) throw err;
        db = client.db(config.dbName);
        callback(client, db);
    });
}

export {
    connect
}