//add default album documents
const conn = new Mongo();
const db = conn.getDB("blog");
const collection = db.getCollection("album");
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
        secret: false
    };
}

!album1 && collection.insertOne(genDoc(1, "文章图片"));

!album2 && collection.insertOne(genDoc(2, "bing图片"));