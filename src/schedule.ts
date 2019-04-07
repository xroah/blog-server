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
import { request } from "./common";
import fs from "fs";

function connect(callback: Function) {
    MongoClient.connect(`${config.devDbURL}${config.dbName}`, {
        useNewUrlParser: true,
        auth: {
            user: config.dbUser,
            password: config.dbPwd
        }
    }, (err, client) => {
        if (err) throw err;
        let db = client.db(config.dbName);
        if (typeof callback === "function") {
            callback(db, client);
        }
    });
}

function resetTodayViewed() {
    connect((db: Db, client: MongoClient) => {
        db.collection("articles")
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
        client.close();
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
                fs.mkdir(dir, { recursive: true }, err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(dir);
                    }
                });
            } else {
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
        console.log(err)
        return;
    }
    let info = parseUrl(JSON.parse(img.toString()));
    download(info);
}

async function download(info: any) {
    let ext = path.extname(info.path.split("&")[0]);
    let name = info.copyright;
    let filename = `${new ObjectID()}${ext}`;
    const mimeMap: any = {
        ".jpg": "image/jpeg",
        ".png": "image/png"
    };
    let ret: any;
    let dir: any;
    try {
        dir = await mkdir();
        ret = await request(true, {
            host: info.host,
            path: info.path
        });
    } catch (err) {
        console.log(err);
        return;
    }
    let _path = `${dir}/${filename}`;
    fs.writeFile(_path, ret, (err) => {
        if (err) {
            return console.log(err);
        }
        connect((db: Db, client: MongoClient) => {
            db.collection("resources").insertOne({
                albumId: 2,
                createTime: new Date(),
                mimetype: mimeMap[ext],
                path: _path,
                size: ret.length,
                encoding: null,
                relPath: _path.split(config.uploadBaseDir)[1],
                originalname: name,
                name,
                filename
            });
            client.close();
        })
    });
}

schedule.scheduleJob("00 00 00 * * *", () => {
    resetTodayViewed();
    startDownload();
});