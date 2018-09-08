const router = require("express").Router();
const query = require("../../db/query");
const queryArticle = require("../../db/queryArticle");
const ObjectID = require("mongodb").ObjectID;

router.get("/details/:id", (req, res) => {
    queryArticle.getById(req.params.id).then(ret => {
        if (ret) {
            res.json({
                errCode: 0,
                data: ret
            });
        } else {
            res.json({
                errCode: 1,
                errMsg: "文章不存在"
            });
        }
    });
});

router.route("/classify").get((req, res) => {
    query.find("classify", {}).then(ret => {
        res.json({
            errCode: 0,
            data: ret || []
        });
    });
}).post((req, res) => {
    let collec = "classify";
    let {
        name,
        pid
    } = req.body;
    if (pid) {
        pid = new ObjectID(pid);
    }
    query.findOne(collec, {
        name,
        pid
    }).then(ret => {
        if (ret) {
            res.send({
                errCode: 1,
                errMsg: "分类已存在"
            });
            return 1;
        }
    }).then(num => {
        if (num) return;
        let doc = {
            name,
            pid,
            createTime: new Date()
        }
        query.insertOne(collec, doc).then(ret => {
            res.send({
                errCode: 0,
                data: ret.ops[0]
            });
        });
    })
}).put((req, res) => {
    query.findOneAndUpdate("classify", {
        _id: new ObjectID(req.body.id)
    }, {
            $set: {
                name: req.body.name
            }
        }).then(ret => {
            if (ret.value) {
                res.json({
                    errCode: 0
                });
            } else {
                res.json({
                    errCode: 404,
                    errMsg: "分类不存在"
                });
            }
        });
}).delete((req, res) => {
    let id = new ObjectID(req.body.id);
    query.findOne("classify", {
        pid: id
    }).then(ret => {
        if (ret) {
            res.send({
                errCode: 1,
                errMsg: "该分类下有子分类，不能删除!"
            });
            return 1;
        }
    }).then(num => {
        if (!num) {
            return query.findOne("articles", {
                $or: [{
                    firstLevelId: id
                },
                {
                    secondLevelId: id
                }
                ]
            });
        }
        return num;
    }).then(ret => {
        if (!ret) {
            query.deleteOne("classify", {
                _id: ObjectID(req.body.id)
            }).then(ret => {
                res.send({
                    errCode: 0
                });
            });
        } else {
            res.json({
                errCode: 2,
                errMsg: "该分类下有文章,不能删除!"
            });
        }
    });
});

router.route("/:page?/:keywords?").get((req, res) => {
    let {
        params
    } = req;
    queryArticle.getByCond(params, {
        all: true
    }).then(([count, list]) => {
        res.json({
            errCode: 0,
            data: {
                count,
                list
            }
        });
    });
    return
}).post((req, res) => {
    let {
        body
    } = req;
    query.insertOne("articles", {
        title: body.title,
        content: body.content,
        secret: body.secret,
        createTime: new Date(),
        lastUpdate: new Date(),
        totalViewed: 0,
        todayViewed: 0,
        tags: body.tags,
        firstLevelId: new ObjectID(body.firstLevelId),
        secondLevelId: new ObjectID(body.secondLevelId),
        summary: body.summary
    }).then(ret => {
        res.json({
            errCode: 0
        });
    });
}).put((req, res) => {
    let {
        body
    } = req;
    query.findOneAndUpdate("articles", {
        _id: new ObjectID(body.id),
    }, {
            $set: {
                title: body.title,
                content: body.content,
                secret: body.secret,
                tags: body.tags,
                lastUpdate: new Date(),
                firstLevelId: new ObjectID(body.firstLevelId),
                secondLevelId: new ObjectID(body.secondLevelId),
                summary: body.summary
            }
        }).then(ret => {
            if (ret.value) {
                res.json({
                    errCode: 0
                });
            } else {
                res.json({
                    errCode: 404,
                    errMsg: "文章不存在"
                });
            }
        });
}).delete((req, res) => {
    query.findOneAndDelete("articles", {
        _id: new ObjectID(req.body.id)
    }).then(ret => {
        if (ret.value) {
            res.json({
                errCode: 0
            });
        } else {
            res.json({
                errCode: 404,
                errMsg: "文章不存在"
            });
        }
    });
});

module.exports = router;