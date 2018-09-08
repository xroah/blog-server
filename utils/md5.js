const crypto = require("crypto");

module.exports = function md5(str) {
    let ret;
    if (str === undefined) return ret;
    if (typeof str !== "string") {
        str = String(str);
    }
    let hash = crypto.createHash("md5");
    ret = hash.update(str).digest("hex");
    return ret;
}