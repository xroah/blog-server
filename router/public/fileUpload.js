const router = require("express").Router();
const multer = require("multer");
const fs = require("fs");
const md5 = require("../../utils/md5");

function generateDir() {
    let date = new Date();
    let year = date.getFullYear();
    let mon = date.getMonth() + 1;
    let yearDir = `uploads/${year}`;
    let monDir = `${yearDir}/${mon}`;
    if (!fs.existsSync(yearDir)) {
        fs.mkdirSync(yearDir);
    }
    if (!fs.existsSync(monDir)) {
        fs.mkdirSync(monDir);
    }
    return monDir;
}

function getMimeType(mimeType) {
    let mime = {
        "image/jpeg": ".jpg",
        "image/gif": ".gif",
        "image/png": ".png"
    };
    return mime[mimeType];
}

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, generateDir())
    },
    filename: function (req, file, cb) {
        let name = md5(+new Date() + Math.random());
        let ext = getMimeType(file.mimetype);
      cb(null, `${name}${ext}`);
    }
  });

let upload = multer({
    storage
});

router.use("/", upload.single("attachment"), (req, res) => {
    let { destination, filename } = req.file;
    res.json({
        errCode: 0,
        data: `//${req.hostname}:8008${destination.split("uploads")[1]}/${filename}`
    });
});

module.exports = router;