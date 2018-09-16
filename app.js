const express = require("express");
const bodyParser = require("body-parser");

const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const history = require("connect-history-api-fallback");

let app = express();

let router = require("./router");

app.use(session({
    secret: "xroah blog",
    cookie: {
        maxAge: 30 * 60 * 1000 //default half an hour
    },
    //refresh the expire time on every request
    //rolling: refresh the cookie expire time
    //resave: resave to mongoDB
    rolling: true,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        url: "mongodb://127.0.0.1/blog"
    })
}));

//no permission
app.use("/xsys", (req, res, next) => {
    if (!req.session.isAdmin && req.path !== "/login") {
        res.sendFile("static/error/403.html", {
            root: __dirname
        });
        return;
    }
    next();
});

//vue router history mode, response index.html by default
app.use(history({
    //rewrite the api url
    rewrites: [{
        from: /^\/api\/.*$/,
        to: function (context) {
            return context.parsedUrl.path
        }
    }]
}));

app.use(express.static("./static"));
app.use(express.static("./uploads"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))

// parse application/json
app.use(bodyParser.json());

//if input the api url into browser address bar, response empty message
app.all("/api/*", (req, res, next) => {
    if (!req.xhr) {
        res.send("");
        return;
    }
    next();
});
app.all("/api/admin/*", (req, res, next) => {
    //if current user have no permission then response error
    if (!req.session.isAdmin) {
        res.json({
            errCode: 403,
            errMsg: "对不起，您没有权限访问"
        });
        return;
    }
    next();
});
app.use("/api", router);

//404
app.use((req, res) => {
    // res.status(404);
    res.sendFile("static/error/404.html", {
        root: __dirname
    });
});

//handle errors
app.use((err, req, res) => {
    console.log(err)
    if (req.path.startsWith("/api")) {
        res.json({
            errCode: 500,
            errMsg: err.message || "服务器出错啦!"
        });
    } else {

    }
});

module.exports = app;