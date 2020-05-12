import {
    DB_NAME,
    DB_URL
} from "../config";
import { MongoClient, Db, FindOneOptions } from "mongodb";

let db: Db;

export function connectDb(callback: () => void) {
    MongoClient.connect(
        DB_URL,
        {
            useUnifiedTopology: true
        }
    ).then(client => {
        db = client.db(DB_NAME);
        
        callback();
    }).catch(err => console.error(err));
}

export function findOne(collection: string, query: object, options?: FindOneOptions) {
    return db.collection(collection).findOne(query, options);
}