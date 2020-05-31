import {
    Request,
    Response,
    NextFunction
} from "express";
import { findOne, findOneAndUpdate } from "../../db";
import { createHash } from "crypto";

function md5(str: string) {
    return createHash("md5")
        .update(str, "utf8")
        .digest("hex");
}

export function login(
    req: Request,
    res: Response,
    next: NextFunction
) {
    let {
        username,
        password
    } = req.body || {};

    if (!username || !password) {
        return res.json({
            code: -2,
            msg: "请输入用户名和密码！"
        });
    }

    findOne(
        "users",
        {
            username,
            password: md5(password)
        },
        {
            projection: {
                _id: 0,
                password: 0
            }
        }).then(ret => {
            if (!ret) {
                return res.json({
                    code: -1,
                    msg: "用户名或密码错误！"
                });
            }

            const session = req.session || {} as any;
            const token = session.token = md5(`${ret.role}${username}${Math.random()}`);

            session.role = ret.role;
            session.username = username;

            return res.json({
                code: 0,
                msg: "登录成功!",
                data: {
                    ...ret,
                    token
                }
            });
        }).catch(next);
}

export function logout(
    req: Request,
    res: Response,
    next: NextFunction
) {
    req.session?.destroy(err => {
        if (err) {
            return next(err);
        }

        res.json({
            code: 0,
            msg: "退出成功"
        });
    });
}

export async function updatePassword(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const {
        origPwd,
        newPwd
    } = req.body;
    const { username } = req.session as any;
    let ret;

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
        );
    } catch (error) {
        return next(error);
    }

    if (ret.value) {
        return res.json({code: 0});
    }

    res.json({
        code: 1,
        msg: "原密码不正确"
    });
}