import crypto from "crypto";
import { unlink } from "fs";

function md5(s: string) {
    return crypto.createHash("md5").update(s).digest("hex");
}

function delFiles(files: Array<string>) {
    files.forEach(file => {
       unlink(file, e => e);
    });
}

export {
    md5,
    delFiles
};