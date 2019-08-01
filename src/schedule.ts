import schedule from "node-schedule";
import {
    Db,
    MongoClient,
    ObjectID
} from "mongodb";
import config from "./config";
import {
    fetchPic,
    parseUrl
} from "./routes/public/fetchBingPic";
import path from "path";
import {request} from "./common";
import fs from "fs";

function connect(callback: Function) {
    MongoClient.connect(`${config.devDbURL}${config.dbName}`, {
        useNewUrlParser: true,
        auth: {
            user: config.dbUser,
            password: config.dbPwd
        }
    }, (err, client) => {
        if (err) return print(err);
        let db = client.db(config.dbName);
        if (typeof callback === "function") {
            callback(db, client);
        }
    });
}

function print(msg: any) {
    console.log(msg);
}

function resetTodayViewed() {
    connect(async (db: Db, client: MongoClient) => {
        //reset article todayViewed to 0
        try {
            await db.collection("articles")
                .updateMany(
                    {
                        todayViewed: {
                            $gt: 0
                        }
                    },
                    {
                        $set: {
                            todayViewed: 0
                        }
                    }
                ).catch(() => 0);
            await client.close();
        } catch (err) {
            print(err);
        }
    });
}

async function mkdir() {
    let date = new Date();
    let year = date.getFullYear();
    let mon = date.getMonth() + 1;
    let dir = `${config.uploadBaseDir}${config.uploadDir}/${year}/${mon}`;
    return new Promise((resolve, reject) => {
        fs.access(dir, err => {
            if (err) {
                fs.mkdir(dir, {recursive: true}, err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(dir);
                    }
                });
            } else {
                //dir already exists
                resolve(dir);
            }
        });
    });
}

async function startDownload() {
    let img;
    try {
        img = await fetchPic();
    } catch (err) {
        print(err);
        return;
    }
    let info = parseUrl(JSON.parse(img.toString()));
    download(info).catch(e => e);
}

function getDate() {
    var date = new Date();
    var year = date.getFullYear();
    var day = date.getDate();
    var mon = date.getMonth() + 1;
    return `${year}-${mon}-${day}`;
}

async function download(info: any) {
    let ext = path.extname(info.path.split("&")[0]);
    let name = info.copyright.replace(/\//g, "、");
    let filename = `${new ObjectID()}${ext}`;
    let ret: any;
    let dir: any;
    name = getDate() + name;
    try {
        dir = await mkdir();
        ret = await request(true, {
            host: info.host,
            path: info.path
        });
    } catch (err) {
        print(err);
        return;
    }
    let _path = `${dir}/${filename}`;
    fs.writeFile(_path, ret, (err) => {
        if (err) {
            return print(err);
        }
        //after writing file, insert to database
        insertImageToDb({
            name,
            filename,
            path: _path,
            size: ret.length,
            ext
        });
    });
}

interface FileProp {
    filename: string;
    name: string;
    ext: string,
    path: string;
    size: number;
}

function insertImageToDb(file: FileProp) {
    const mimeMap: any = {
        ".jpg": "image/jpeg",
        ".png": "image/png"
    };
    connect(async (db: Db, client: MongoClient) => {
        try {
            await db.collection("resources").insertOne({
                albumId: 2,
                createTime: new Date(),
                mimetype: mimeMap[file.ext],
                path: file.path,
                size: file.size,
                encoding: null,
                relPath: file.path.split(config.uploadBaseDir)[1],
                originalname: file.name,
                name: file.name,
                filename: file.filename
            });
            await client.close();
        } catch (err) {
            print(err);
        }
    })
}

schedule.scheduleJob("00 00 00 * * *", () => {
    resetTodayViewed();
    startDownload().catch(e => e);
    print("===============schedule executed successfully===============");
});
