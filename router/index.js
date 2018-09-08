const express = require("express");
const router = express.Router();
const thirdParty = require("./public/thirdParty");
const user = require("./public/user");
const admin = require("./admin");
const upload = require("./public/fileUpload");
const public = require("./public");

router.use("/thirdParty", thirdParty);
router.use("/user", user);
router.use("/admin", admin)
router.use("/upload", upload);
router.use("/public", public);

module.exports = router;