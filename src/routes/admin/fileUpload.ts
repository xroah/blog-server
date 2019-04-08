import {
    Router,
    Request,
    Response,
    NextFunction
} from "express";
import multer from "multer";
import {ObjectID} from "mongodb";
import {
    resolve,
    extname
} from "path";
import {
    access,
    mkdir,
    MakeDirectoryOptions
} from "fs";
import {response} from "../../common";
import {insert} from "../../db";
import log from "../../logger";
import config from "../../config";

interface Callback {
    (arg1?: any): void;
}

function _mkdir(dir: string, options: MakeDirectoryOptions, callback: Callback) {
    access(dir, err => {
        if (err) {
            mkdir(dir, options, () => callback(dir));
        } else {
            callback(dir);
        }
    });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let date = new Date();
        let year = date.getFullYear();
        let mon = date.getMonth() + 1;
        let dir = `${config.uploadBaseDir}/${config.uploadDir}/${year}/${mon}`;
        _mkdir(
            dir,
            {recursive: true},
            (dir: string) => {
                log(`upload directory: ${dir}`);
                cb(null, resolve(dir));
            }
        );
    },
    filename: function (req, file, cb) {
        let ext = extname(file.originalname);
        let filename = new ObjectID().toHexString();
        filename = `${filename}${ext}`;
        log(`upload file: ${JSON.stringify(file)}, saved filename: ${filename}`);
        cb(null, filename);
    }
});

const upload = multer({storage}).single("attachment");

const router = Router();

async function saveFile(req: Request, res: Response, next: NextFunction) {
    upload(req, res, err => {
        if (err) {
            return next(err);
        }
        next();
    });
}

async function save2Db(req: Request, res: Response, next: NextFunction) {
    let {
        albumId = 1,
        name
    } = req.body;
    let {
        mimetype,
        path,
        size,
        encoding,
        originalname,
        filename
    } = req.file;
    let url = path.split(resolve(config.uploadBaseDir))[1];
    log(`Save file to database(resources): ${JSON.stringify(req.file)}`);
    try {
        if (albumId == 1 || albumId == 2) {
            albumId = +albumId;
        } else {
            albumId = new ObjectID(albumId);
        }
        await insert("resources", {
            albumId,
            createTime: new Date(),
            mimetype,
            path,
            relPath: url,
            size,
            encoding,
            originalname: originalname,
            filename: filename,
            name
        });
    } catch (err) {
        return next(err);
    }
    response(res, 0, {
        url
    });
}

router.post("/upload", saveFile, save2Db);
export default router;