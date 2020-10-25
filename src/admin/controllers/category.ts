import {
    Request,
    Response,
    NextFunction
} from "express"
import {ObjectID} from "mongodb"
import {
    findOneAndUpdate,
    findOneAndDelete,
    findOne
} from "../../db"
import {CATEGORIES, ARTICLES} from "../../db/collections"
import fs from "fs"
import promisify from "../../common/utils/promisify"
import Code from "../../code"

export {queryCategory} from "../../common/controllers/category"

export async function saveCategory(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const {
        categoryId,
        categoryName,
        categoryDesc,
        cover
    } = req.body
    const isEdit = !!categoryId

    try {
        const _id = new ObjectID(categoryId)
        const data: any = {
            _id,
            name: categoryName,
            desc: categoryDesc,
            modifyTime: new Date(),
            cover
        }

        if (!isEdit) {
            const exist = await findOne(CATEGORIES, {name: categoryName})
            data.createTime = new Date()

            if (exist) {
                return res.error(Code.COMMON_ERROR, "分类已存在")
            }
        }

        await findOneAndUpdate(
            CATEGORIES,
            {_id},
            {$set: data},
            {upsert: true}
        )
    } catch (error) {
        return next(error)
    }

    res.json2(Code.SUCCESS)
}

async function delCover(url: string) {
    try {
        await promisify(fs.unlink)(`${process.env.HOME}${url}`)
    } catch (error) {

    }
}

export async function delCategory(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const {
        categoryId
    } = req.body
    let ret

    try {
        const _id = new ObjectID(categoryId)
        const article = await findOne(ARTICLES, {categoryId: _id})

        if (article) {
            return res.error(Code.SUCCESS, "有文章属于该分类，不能删除")
        }

        ret = await findOneAndDelete(CATEGORIES, {_id})
    } catch (error) {
        return next(error)
    }

    if (ret.value) {
        delCover(ret.value.cover)

        return res.json2(Code.SUCCESS)
    }

    res.error(Code.NOT_EXISTS, "分类不存在或已被删除")
}
