const methods = Object.freeze({
    get: "GET",
    post: "POST",
    patch: "PATCH",
    delete: "DELETE"
});

const CsrfTokenFrom = Object.freeze({
    post: "post",
    login: "login",
    upload: "upload",
    settings: "settings",
    register: "register",
    recovery: "recovery"
});

const endpoints = Object.freeze({
    home: "/",
    login: "/login",
    upload: "/upload",
    settings: "/settings",
    register: "/register",
    newImage: "/newImage",
    recovery: "/recovery"
});

const apiEndpoints = Object.freeze({
    /* Auth */
    login: "/api/auth/login",
    access: "/api/auth/access",
    logout: "/api/auth/logout",
    csrfToken: "/api/auth/csrf",
    refresh: "/api/auth/refresh",
    register: "/api/auth/register",
    recovery: "/api/auth/recovery",
    sendRecovery: "/api/auth/send-recovery",
    silentLogout: "/api/auth/silent-logout",

    /* Api */
    user: "/api/users",
    like: "/api/likes", 
    image: "/api/images",
    comment: "/api/comments"
});

const historyState = Object.freeze({
    push: "push",
    nopush: "nopush",
    replace: "replace"
});

const keyToSessionStorage = Object.freeze({
    profile: "profile",
    csrfToken: "csrfToken",
    accessToken: "accessToken"
})

const host = "http://localhost:2000";

const stickersPaths = [
    {src: "Walnut.png", alt: "Walnut-san"},
    {src: "Cat-san.png",  alt: "Cato-sando"},
    {src: "Cat-san-1.png", alt: "Cato-sando"}, 
    {src: "Cat-san-2.png", alt: "Cato-sando"},
    {src: "Cat-san-3.png", alt: "Cato-sando"}, 
    {src: "Cat-san-4.png", alt: "Cato-sando"},
    {src: "Cat-san-5.png", alt: "Cato-sando"}, 
    {src: "Cat-san-6.png", alt: "Cato-sando"}
];

export {
    host,
    methods,
    endpoints,
    historyState,
    apiEndpoints,
    stickersPaths,
    CsrfTokenFrom,
    keyToSessionStorage
};