import {
    Request,
    Response,
    NextFunction
} from "express"
import {
    redisGet,
    redisSet,
    redisClient,
    redisDel
} from "../../db"
import signature from "cookie-signature"
import noop from "../../common/utils/noop"
import isAdmin from "./isAdmin"
import { SESSION_KEY } from "../../config"
import Code from "../../code"

export default async function limitRequest(
    req: Request,
    res: Response,
    next: NextFunction,
    operate: () => any
) {
    const sessId = req.session!.id
    const BUSY_MSG = "您的操作过于频繁，请稍候重试"
    let ret

    if (isAdmin(req)) {
        try {
            ret = await operate()

            if (ret instanceof Error) {
                return next(ret)
            }
        } catch (error) {
            return next(error)
        }
    } else {
        const cookie = String(req.cookies["connect.sid"] || "").substring(2)
        const _sessId = signature.unsign(cookie, SESSION_KEY)

        if (sessId !== _sessId) {
            return res.error(Code.UNKNOWN_ERROR, "未知错误")
        }

        try {
            const saved = await redisGet(sessId)
            //user can post one time within 1 minute
            if (saved) {
                return res.error(Code.FEQUENCy_ERROR, BUSY_MSG)
            }

            ret = await operate()

            if (ret instanceof Error) {
                return next(ret)
            }

            await redisSet(sessId, "saved")
            redisClient.expire(sessId, 60, noop)
        } catch (error) {
            redisDel(sessId)

            return next(error)
        }
    }

    res.json2(Code.SUCCESS, ret)
}