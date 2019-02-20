import express from "express";

const admin = express();

admin.get("/", (req, res) => {
    res.end("Admin page!");
});

export default admin;