import {
    DB_NAME,
    DB_URL
} from "../config";
import redis from "redis";
import {
    MongoClient,
    Db,
    FindOneOptions,
    UpdateOneOptions,
    CollectionInsertOneOptions,
    FindOneAndUpdateOption,
    UpdateManyOptions,
    FindOneAndDeleteOption,
    CommonOptions
} from "mongodb";
import promisify from "../common/utils/promisify";

let db: Db;

export const redisClient = redis.createClient();
export const redisGet = promisify(redisClient.get.bind(redisClient));
export const redisSet = promisify(redisClient.set.bind(redisClient));
export const redisDel = promisify(redisClient.del.bind(redisClient));

export function connectDb(callback: (db: Db, client: MongoClient) => void) {
    MongoClient.connect(
        DB_URL,
        {
            useUnifiedTopology: true
        }
    ).then(client => {
        db = client.db(DB_NAME);

        callback(db, client);
    }).catch(err => console.error(err));
}

export function find(collection: string, filter: object, options?: FindOneOptions<any>) {
    return db.collection(collection).find(filter, options);
}

export function findOne(collection: string, query: object, options?: FindOneOptions<any>) {
    return db.collection(collection).findOne(query, options);
}

export function findOneAndUpdate(collection: string, filter: object, update: object, options?: FindOneAndUpdateOption<any>) {
    return db.collection(collection).findOneAndUpdate(filter, update, options);
}

export function findOneAndDelete(collection: string, filter: object, options?: FindOneAndDeleteOption<any>) {
    return db.collection(collection).findOneAndDelete(filter, options);
}

export function updateOne(collection: string, filter: object, update: object, options?: UpdateOneOptions) {
    return db.collection(collection).updateOne(filter, update, options);
}

export function updateMany(collection: string, filter: object, update: object, options?: UpdateManyOptions) {
    return db.collection(collection).updateMany(filter, update, options);
}

export function insertOne(collection: string, doc: object, options?: CollectionInsertOneOptions) {
    return db.collection(collection).insertOne(doc, options);
}

export function deleteMany(collection: string, filter: object, options?: CommonOptions) {
    return db.collection(collection).deleteMany(filter, options);
}

export { db }