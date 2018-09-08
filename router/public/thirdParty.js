const http = require("http");
const https = require("https");
const router = require("express").Router();

//get ciba daily sentence
router.get("/daliySentence", (request, response) => {
    response.setHeader("Content-Type", "application/json;charset=utf-8");
    let req = http.request({
        host: "open.iciba.com",
        path: "/dsapi/",
    }, res => {
        let resData = "";
        res.on("data", chunk => {
            resData += chunk;
        });
        res.on("end", () => {
            response.json({
                errCode: 0,
                data: JSON.parse(resData)
            });
        });
    });
    req.on("error", err => {
        response.json({
            errCode: 1,
            data: err,
            errMsg: err.message
        });
    });
    req.end();
});

//get bing daily picture
router.get("/dailyPicture", (request, response) => {
    response.setHeader("Content-Type", "application/json;charset=utf-8");
    let req = https.request({
        host: "cn.bing.com",
        path: "/HPImageArchive.aspx?format=js&idx=0&n=1"
    }, res => {
        let resData = "";
        res.on("data", chunk => {
            resData += chunk;
        });
        res.on("end", () => {
            response.json({
                errCode: 0,
                data: JSON.parse(resData)
            });
        });
    });
    req.on("error", err => {
        response.json({
            errCode: 1,
            errMsg: err.message,
            data: err
        });
    });
    req.end();
})

module.exports = router;