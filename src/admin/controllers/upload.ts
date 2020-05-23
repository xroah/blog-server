import multer from "multer";
import { ObjectID } from "mongodb";
import {
    existsSync,
    mkdirSync
} from "fs";
import {
    Request,
    Response,
    NextFunction
} from "express";

const FIELD_NAME = "articleImage";

const mimeType = new Map([
    ["image/png", ".png"],
    ["image/jpeg", ".jpg"]
]);

const storage = multer.diskStorage({
    destination(req, file, cb) {
        const date = new Date();
        const year = date.getFullYear();
        const mon = String(100 + date.getMonth() + 1).substring(1);
        const dir = `/uploads/${year}/${mon}`;
        const dest = `${process.env.HOME || "/"}${dir}`;

        (file as any).dir = dir;

        if (!existsSync(dest)) {
            mkdirSync(dest, { recursive: true });
        }

        cb(null, dest);
    },
    filename(req, file, cb) {
        const ext = mimeType.get(file.mimetype) as string;
        const id = new ObjectID();
        const name = id + ext;

        cb(null, name);
    }
});
const uploads = multer({ storage }).single(FIELD_NAME);

export default function upload(
    req: Request,
    res: Response,
    next: NextFunction
) {
    uploads(req, res, (err: any) => {
        if (err) {
            return next(err);
        }

        const { 
            filename,
            dir
        } = req.file as any;

        res.json({
            code: 0,
            data: {
                url: `${dir}/${filename}`
            }
        });
    });
}