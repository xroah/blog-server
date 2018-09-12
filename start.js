const connectDb = require("./db/connect");
//start app when db connected
connectDb(client => {
    global.mongoClient = client;
    require("./app").listen(8008);
});