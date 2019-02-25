import {
    MongoClient,
    Db,
    CollectionInsertManyOptions,
    FindOneOptions,
    UpdateManyOptions
} from "mongodb";
import config from "../config";
import qa, { Options } from "./queryArticle";

let db: Db;

function connect(callback: Function) {
    MongoClient.connect(config.devDbURL, {
        useNewUrlParser: true
    }, (err, client) => {
        if (err) throw err;
        db = client.db(config.dbName);
        callback(client, db);
    });
}

function insert(c: string, data: Object | Array<Object>, options?: CollectionInsertManyOptions) {
    if (Array.isArray(data)) {
        return db.collection(c).insertMany(data, options);
    }
    return db.collection(c).insertOne(data, options)
}

function find(c: string, query: Object, options?: FindOneOptions) {
    return db.collection(c).find(query, options);
}

function findOne(c: string, query: Object, options: FindOneOptions) {
    return db.collection(c).findOne(query, options);
}

function count(c: string) {
    return db.collection(c).countDocuments();
}

function update(c: string, filter: Object, update: Object | Array<Object>, options?: UpdateManyOptions) {
    if (Array.isArray(update)) {
        return db.collection(c).updateMany(filter, update, options);
    }
    return db.collection(c).updateOne(filter, update, options);
}

function queryArticle(c: string, opts: Options) {
  return qa(db, c, opts); 
}

export {
    connect,
    insert,
    find,
    findOne,
    count,
    queryArticle,
    update
}