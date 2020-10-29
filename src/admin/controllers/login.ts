import {
    Request,
    Response,
    NextFunction
} from "express"
import {
    findOne,
    findOneAndUpdate,
    redisGet,
    redisSet,
    redisClient,
    redisDel
} from "../../db"
import {createHash} from "crypto"
import Code from "../../code"
import noop from "../../common/utils/noop"

function md5(str: string) {
    return createHash("md5")
        .update(str, "utf8")
        .digest("hex")
}

export async function login(
    req: Request,
    res: Response,
    next: NextFunction
) {
    let {
        username,
        password
    } = req.body || {}
    const MAX_COUNT = 5
    const sess = req.session!
    const sessId = sess.id
    const redisKey = req.ip || sessId
    let ret
    let remainCount = 0

    if (!username || !password) {
        return res.error(Code.COMMON_ERROR, "请输入用户名和密码！")
    }

    try {
        remainCount = await redisGet(redisKey)

        if (remainCount == undefined) {
            remainCount = MAX_COUNT
        } else if (remainCount <= 0) {
            return res.error(Code.LOGIN_ERROR, "输入密码次数超过限制！")
        }
    } catch (error) {
    }

    try {
        ret = await findOne(
            "users",
            {
                username,
                password: md5(password)
            },
            {
                projection: {
                    createTime: 0,
                    password: 0
                }
            })
    } catch (error) {
        return next(error)
    }

    if (!ret) {
        try {
            await redisSet(redisKey, --remainCount)

            redisClient.expire(redisKey, 3600)
        } catch (error) {

        }

        return res.error(Code.LOGIN_ERROR, `用户名或密码错误， 还有${remainCount}次机会`)
    }

    const token = sess.token = md5(`${ret.role}${username}${Math.random()}`)

    sess.role = ret.role
    sess.username = username
    sess.userId = ret._id

    redisDel(redisKey).catch(noop)

    return res.json2(
        Code.SUCCESS,
        {
            ...ret,
            token
        }
    )
}

export function logout(
    req: Request,
    res: Response,
    next: NextFunction
) {
    req.session!.destroy(err => {
        if (err) {
            return next(err)
        }

        res.json2(Code.SUCCESS)
    })
}

export async function updatePassword(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const {
        origPwd,
        newPwd
    } = req.body
    const {username} = req.session!
    let ret

    try {
        ret = await findOneAndUpdate(
            "users",
            {
                username,
                password: md5(origPwd)
            },
            {
                $set: {
                    password: md5(newPwd)
                }
            }
        )
    } catch (error) {
        return next(error)
    }

    if (ret.value) {
        return res.json2(Code.SUCCESS)
    }

    res.error(Code.COMMON_ERROR, "原密码不正确")
}