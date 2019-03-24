import {
    MongoClient,
    Db,
    CollectionInsertManyOptions,
    FindOneOptions,
    FindOneAndUpdateOption,
    UpdateManyOptions,
    CommonOptions,
    CollectionAggregationOptions

} from "mongodb";
import config from "../config";
import qa, { Options } from "./queryArticle";

let db: Db;

function connect(callback: Function) {
    MongoClient.connect(`${config.devDbURL}${config.dbName}`, {
        useNewUrlParser: true,
        auth: {
            user: config.dbUser,
            password: config.dbPwd
        }
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

function find(c: string, query: Object = {}, options?: FindOneOptions) {
    return db.collection(c).find(query, options);
}

function findOne(c: string, query: Object, options?: FindOneOptions) {
    return db.collection(c).findOne(query, options);
}

function findOneAndUpdate(c: string, query: Object, update: Object, options?: FindOneAndUpdateOption) {
    return db.collection(c).findOneAndUpdate(query, update, options);
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

interface DeleteOptions extends CommonOptions {
    many?: boolean;
}

function del(c: string, filter: Object, options: DeleteOptions = {many: false}) {
    let collec = db.collection(c);
    if (options.many) {
        return collec.deleteMany(filter, options);
    }
    return collec.deleteOne(filter, options);
}

function aggregate(c: string, pipeline: Array<Object>, options?: CollectionAggregationOptions) {
    return db.collection(c).aggregate(pipeline);
}

export {
    connect,
    insert,
    find,
    findOne,
    findOneAndUpdate,
    count,
    queryArticle,
    update,
    del,
    aggregate
}