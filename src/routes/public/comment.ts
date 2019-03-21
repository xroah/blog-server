import {
    Router,
    Request,
    Response,
    NextFunction
} from "express";
import {
    insert,
    findOne
} from "../../db";
import { response } from "../../common";
import { ObjectID } from "mongodb";

const router = Router();

async function beforeSave(req: Request, res: Response, next: NextFunction) {
    let {
        articleId,
        content
    } = req.body;
    let article;
    if (!articleId) {
        return response(res, 1, null, "缺少id!");
    } else if (!content) {
        return response(res, 1, null, "缺少评论内容!");
    }
    try {
        article = await findOne("articles", {
            _id: new ObjectID(articleId)
        });
    } catch (err) {
        return next(err);
    }
    if (article) {
        next();
    } else {
        response(res, 1, null, "文章不存在!");
    }
}

async function saveComment(req: Request, res: Response, next: NextFunction) {
    let {
        articleId,
        content,
        username = null,
        replyTo,
        userHomepage = null
    } = req.body;
    let s: any = req.session;
    let ret;
    try {
        ret = await insert(
            "comments",
            {
                articleId: new ObjectID(articleId),
                content,
                username: s.isAdmin ? "作者" : username,
                userHomepage: s.isAdmin ? null : userHomepage,
                replyTo: replyTo ? new ObjectID(replyTo) : null,
                createTime: new Date()
            }
        );
    } catch (err) {
        return next(err)
    }
    response(res, 0, ret);
}

router.post("/comment", beforeSave, saveComment);

export default router;