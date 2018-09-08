const router = require("express").Router();
const query = require("../../db/query");
const queryArticle = require("../../db/queryArticle");
const ObjectID = require("mongodb").ObjectID;

router.get("/details/:id", (req, res) => {
    queryArticle.getById(req.params.id).then(ret => {
        if (ret && ret.secret === "0") {
            res.json({
                errCode: 0,
                data: {
                    article: ret
                }
            });
        } else {
            res.json({
                errCode: 1,
                errMsg: "文章不存在"
            });
        }
    });
});

router.get("/:page?/:keywords?", (req, res) => {
    let {
        params
    } = req;
    queryArticle.getByCond(params, {
        summary: true,
        all: false
    }).then(([count, list]) => {
        res.json({
            errCode: 0,
            data: {
                count,
                list
            }
        });
    });
});

router.post("/updateViewedTimes", async (req, res) => {
    let _id = new ObjectID(req.body.id);
    try {
        await query.updateOne("articles", {
            _id
        }, {
                $inc: {
                    totalViewed: 1,
                    todayViewed: 1
                }
            });
    } catch (err) { }
    res.json({
        errCode: 0
    });
});

module.exports = router;