const router = require("express").Router();
const article = require("./article");

router.use("/article", article);

module.exports = router;