import archiver from "archiver";
import {
    createReadStream,
    createWriteStream,
    mkdir,
    unlink
} from "fs";
import {find} from "../../db";
import {
    Router,
    Request,
    Response,
    NextFunction
} from "express";
import {ObjectID} from "mongodb";
import {RESOURCES} from "../../db/collections";
import {response} from "../../common";

const router = Router();
const TMP_DIR = "/tmp/download";

async function _mkdir(dir: string) {
    return new Promise((resolve, reject) => {
        mkdir(dir, err => {
            if (err) {
                if (err.code === "EEXIST") {
                    resolve();
                } else {
                    reject();
                }
                return;
            }
            resolve();
        })
    });
}

async function createFile(req: Request, res: Response, next: NextFunction) {
    let {
        ids,
        name = "相册"
    } = req.query;
    let images: Array<any> = [];
    try {
        ids = JSON.parse(ids);
        if (!Array.isArray(ids)) {
            return next(new Error("ids不是数组"));
        }
        ids = ids.map(id => new ObjectID(id));
        images = await find(RESOURCES, {
            _id: {
                $in: ids
            }
        }).toArray();
    } catch (err) {
        return next(err);
    }
    if (!images.length) {
        response(res, 1, null, "图片不存在");
    } else {
        const filename = `【批量下载】${name}${Date.now()}.zip`;
        req.query.filename = filename;
        await _mkdir(TMP_DIR);
        const output = createWriteStream(`${TMP_DIR}/${filename}`);
        const zip = archiver("zip", {
            zlib: {
                level: 9
            }
        });
        zip.on("error", (err: Error) => next(err));
        zip.on("end", () => next());
        zip.pipe(output);
        images.forEach(img => {
            let split = img.filename.split(".");
            let name = img.name || split[0];
            name = `${name}.${split[1]}`;
            zip.append(createReadStream(img.path), {name});
        });
        zip.finalize();
    }
}

function download(req: Request, res: Response, next: NextFunction) {
    const {filename} = req.query;
    const path = `${TMP_DIR}/${filename}`;
    const stream = createReadStream(path);
    res.set({
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURI(filename)}"`
    });
    stream.pipe(res);
    stream.on("error", err => next(err));
    stream.on("end", () => {
        //delete the file
        unlink(path, e => e);
        res.end();
    })
}

router.get("/downloadImages", createFile, download);

export default router;