//add to user home directory
//add default album documents
const conn = new Mongo();
let db;

db = conn.getDB("admin");

db.auth("root", "123456");

let user = db.getUser("root");

if (!user) {
    db.createUser({
        user: "root",
        pwd: "123456",
        roles: ["root"]
    });
}

db.logout();

db = db.getSiblingDB("blog");

db.auth("blogAdmin", "123456");

let userCount = db.getCollection("users").count();

if (!userCount) {
    db.getCollection("users").insertOne({
        username: "admin",
        password: "14e1b600b1fd579f47433b88e8d85291"
    });
}

let collection = db.getCollection("albums");

const album1 = collection.findOne({
    _id: 1
});
const album2 = collection.findOne({
    _id: 2
});

function genDoc(id, name) {
    return {
        _id: id,
        name: name,
        createTime: new Date(),
        secret: false,
        cover: null,
        desc: ""
    };
}

!album1 && collection.insertOne(genDoc(1, "文章图片"));

!album2 && collection.insertOne(genDoc(2, "bing图片"));
user = db.getUser("blogAdmin");

if (!user) {
    db.createUser({
        user: "blogAdmin",
        pwd: "123456",
        roles: [{
            role: "readWrite",
            db: "blog"
        }]
    });
}

db.logout();

print("----------------Excuted successfully.-----------------");