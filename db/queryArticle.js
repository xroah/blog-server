const query = require("./query");
const ObjectID = require("mongodb").ObjectID;

let $lookup = {
    from: "classify",
    let: {
        s_id: "$secondLevelId"
    },
    pipeline: [{
            $match: {
                $expr: {
                    $eq: ["$_id", "$$s_id"]
                }
            }
        },
        {
            $project: {
                _id: 0,
                name: 1
            }
        }
    ],
    as: "classification"
};

module.exports = {
    getByCond(params, options = {}) {
        let page = params.page || 1;
        let keywords = params.keywords;
        let $match = {};
        if (keywords) {
            $match.content = new RegExp(keywords, "ig");
        }
        let count = query.count("articles", $match);
        let $project = {
            clsName: "$classification.name",
            title: 1,
            secret: 1,
            createTime: 1,
            totalViewed: 1,
            todayViewed: 1,
            tags: 1
        };
        if (options.summary) {
            $project.summary = 1;
        }
        if (!options.all) {
            $match.secret = "0";
        }
        let articles = query.aggregate("articles", [{
                $match
            },
            {
                $skip: (page - 1) * 10
            }, {
                $lookup
            }, {
                $unwind: "$classification"
            },
            {
                $limit: 10
            },
            {
                $sort: {
                    createTime: -1,
                }
            },
            {
                $project

            }
        ]).toArray();
        return Promise.all([count, articles]);
    },
    async getById(id) {
        let _id = new ObjectID(id);
        let ret = await query.aggregate("articles", [{
                $match: {
                    _id
                }
            }, {
                $lookup
            }, {
                $unwind: "$classification"
            },
            {
                $addFields: {
                    clsName: "$classification.name"
                }

            }, {
                $project: {
                    classification: 0
                }
            }
        ]).toArray();
        return ret[0];
    }
}