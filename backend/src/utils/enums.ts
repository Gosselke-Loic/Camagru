enum ErrorsEnum {
    Allow = "allow",
    Server = "server",
    Conflict = "conflict",
    NotFound = "notFound",
    Forbidden= "forbidden",
    BadRquest = "badRequest",
    Unauthorized = "unauthorized",
    PayloadTooLarge = "Payload Too Large",
    UnsupportedMediaType = "unsupportedMediatype"
};

enum Roles {
    user = "user",
    admin = "admin"
};

enum Routes {
    // Auth
    login = "/api/auth/login",
    access = "/api/auth/access",
    logout = "/api/auth/logout",
    csrf = "/api/auth/csrf?from=",
    register = "/api/auth/register",
    recovery = "/api/auth/recovery",

    silentLogout = "/api/auth/silent-logout",
    sendRecovery = "/api/auth/send-recovery",
    verificationMail = "/api/auth/verify-email?token=",

    // Resources
    like = "/api/likes",
    user = "/api/users", 
    image = "/api/images",
    comment = "/api/comments"
};

enum UploadDirectory {
    upload = "./uploads",
    sample = "./samples"
};

enum CsrfTokenFrom {
    post = "post",
    login = "login",
    upload = "upload",
    settings = "settings",
    register = "register",
    recovery = "recovery"
};

enum Methods {
    GET = "GET",
    POST = "POST",
    PATCH = "PATCH",
    DELETE = "DELETE"
};

export {
    Roles,
    Routes,
    Methods,
    ErrorsEnum,
    CsrfTokenFrom,
    UploadDirectory
};