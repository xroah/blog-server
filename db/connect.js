const MongoClient = require("mongodb").MongoClient;

const URL = "mongodb://localhost:27017";

module.exports = function connect(callback) {
    MongoClient.connect(URL, {
        useNewUrlParser: true,
    }, (err, client) => {
        if (err) {
            throw err;
        }
        if (typeof callback === "function") {
            callback(client);
        }
    });
}