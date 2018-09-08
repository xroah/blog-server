const DATABASE = global.dbConn;

module.exports = {
    aggregate(collection, pipeline, option, callback) {
        let collec = DATABASE.collection(collection);
        if (typeof callback === "function") {
            callback();
        }
        return collec.aggregate(pipeline, option);
    },
    count(collection, query) {
        let collec = DATABASE.collection(collection);
        return collec.countDocuments(query);
    },
    findOne(collection, query, options) {
        let collec = DATABASE.collection(collection);
        return collec.findOne(query, options);
    },
    find(collection, query, options) {
        let collec = DATABASE.collection(collection);
        let cursor = collec.find(query, options);
        return cursor.toArray();
    },
    insertOne(collection, data, options) {
        let collec = DATABASE.collection(collection);
        return collec.insertOne(data, options);
    },
    updateOne(collection, filter, update, options) {
        let collec = DATABASE.collection(collection);
        return collec.update(filter, update, options);
    },
    deleteOne(collection, filter, options) {
        let collec = DATABASE.collection(collection);
        return collec.deleteOne(filter, options);
    },
    findOneAndUpdate(collection, filter, update, options) {
        let collec = DATABASE.collection(collection);
        return collec.findOneAndUpdate(filter, update, options);
    },
    findOneAndDelete(collection, filter, options) {
        let collec = DATABASE.collection(collection);
        return collec.findOneAndDelete(filter, options);
    }
};
