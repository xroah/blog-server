import crypto from "crypto";

function md5(s: string) {
    return crypto.createHash("md5").update(s).digest("hex");
}

export {
    md5
};