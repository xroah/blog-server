import multer from "multer"
import { ObjectID } from "mongodb"
import {
    existsSync,
    mkdirSync
} from "fs"
import {
    Request,
    Response,
    NextFunction
} from "express"
import Code from "../../code"

const FIELD_NAME = "articleImage"

const mimeType = new Map([
    ["image/png", ".png"],
    ["image/jpeg", ".jpg"]
])

const storage = multer.diskStorage({
    destination(_, __, cb) {
        const date = new Date()
        const year = date.getFullYear()
        const mon = String(100 + date.getMonth() + 1).substring(1)
        const dir = `/uploads/${year}/${mon}`
        const dest = `${process.env.HOME || "/"}${dir}`

        if (!existsSync(dest)) {
            mkdirSync(dest, { recursive: true })
        }

        cb(null, dest)
    },
    filename(_, file, cb) {
        const ext = mimeType.get(file.mimetype) as string
        const id = new ObjectID()
        const name = id + ext

        cb(null, name)
    }
})
const uploads = multer({ storage }).single(FIELD_NAME)

export default function upload(
    req: Request,
    res: Response,
    next: NextFunction
) {
    uploads(req, res, (err: any) => {
        if (err) {
            return next(err)
        }

        if (!req.file) {
            return res.error(Code.COMMON_ERROR, "没有文件")
        }

        const {
            filename,
            destination
        } = req.file
        res.json2(Code.SUCCESS, { url: `${destination}/${filename}` })
    })
}