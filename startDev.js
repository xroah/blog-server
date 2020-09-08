const childProc = require("child_process")

process.env.NODE_ENV = "development"

childProc.spawn(
    "nodemon",
    [
        "-e",
        "ts",
        "--exec",
        "ts-node",
        "."
    ],
    {
        stdio: "inherit",
        shell: true
    }
)