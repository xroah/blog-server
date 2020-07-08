import {
    Request,
    Response,
    NextFunction
} from "express";
import { findOneAndDelete } from "../../db";
import { FEEDBACKS } from "../../db/collections";
import { ObjectId } from "mongodb";
import Code from "../../code";
import pagination from "../../db/pagination";

export function queryFeedbacks(
    req: Request,
    res: Response,
    next: NextFunction
) {
    pagination(
        req,
        res,
        next,
        FEEDBACKS,
        []
    );
}

export async function delFeedback(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { feedbackId } = req.body;
    let ret;

    try {
       ret = await findOneAndDelete(
           FEEDBACKS,
           {
               _id: new ObjectId(feedbackId)
           }
       ); 
    } catch (error) {
        return next(error);
    }

    if (ret.value) {
        return res.error(
            Code.NOT_EXISTS,
            "该数据不存在或已被删除"
        );
    }

    res.json2(Code.SUCCESS);
}