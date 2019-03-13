const fs = require("fs");
const path = require("path");


function rmdirSync(dir) {
    if (!fs.existsSync(dir)) return;
    let stat = fs.statSync(dir);
    if (stat.isFile()) {
        return fs.unlinkSync(dir);
    }
    let files = fs.readdirSync(dir);
    let i = 0, l = files.length;
    for (; i < l; i++) {
        let file = files[i];
        let _dir = path.normalize(`${dir}/${file}`);
        let _stat = fs.statSync(_dir);
        if (_stat.isDirectory()) {
            rmdirSync(_dir);
        } else {
            fs.unlinkSync(_dir);
        }
    }
    fs.rmdirSync(dir);
}

rmdirSync("dist");