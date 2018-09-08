const connectDb = require("./db/connect");
//start app when db connected
connectDb(db => {
    global.dbConn = db;
    require("./app").listen(8008);
});