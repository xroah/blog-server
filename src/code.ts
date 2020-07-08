enum Code {
    SUCCESS = 0,
    PASS_ERROR = -1,
    COMMON_ERROR = 1,
    NO_PERM = 403,
    NOT_EXISTS = 404,
    SERVER_ERROR = 500
}

export default Code;