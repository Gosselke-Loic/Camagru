import pg from "pg";
import http, { METHODS } from "node:http";
import { createHash } from "node:crypto";

import sendError from "./utils/error.js";
import { getCookie } from "./utils/cookies.js";
import RecoverCache from "./recover/RecoverCache.js";
import Controller from "./controllers/Controller.js";
import TransporterClass from "./transporter/Transporter.js";
import AuthController from "./controllers/AuthController.js";
import { getAccessTokenFromHeaders } from "./utils/headers.js";
import cipherGenerator from "./tokens/tokenCipher/TokenCipher.js";
import ReadOnlyAccessToken from "./tokens/jwt/ReadOnlyAccessToken.js";
import { CsrfTokenFrom, ErrorsEnum, Methods, Routes } from "./utils/enums.js";
import { CoreControllerConstructor, ProtectedRoute } from "./utils/interfaces.js";

const pool: pg.Pool = new pg.Pool({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 8080,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD
});

const getRoute = (
    url:Readonly<string>,
    method: Readonly<string>
): ProtectedRoute | undefined => {
    const protectedRoutes: ProtectedRoute[] = [
        {route:"/api/auth/me", methods:[Methods.GET]},
        {route:"/api/auth/logout", methods:[Methods.POST]},
        {route:"/api/auth/refresh", methods:[Methods.GET]},
        {route:"/api/images", methods:[Methods.POST, Methods.DELETE]},
        {route:"/api/users", methods:[Methods.GET, Methods.POST, Methods.PATCH]},
        {route:"/api/likes", methods:[Methods.GET, Methods.POST, Methods.DELETE]},
        {route:"/api/comments", methods:[Methods.GET, Methods.POST, Methods.DELETE]},
        {route:`${Routes.csrf}${CsrfTokenFrom.post}`, methods:[Methods.GET, Methods.DELETE]},
        {route:`${Routes.csrf}${CsrfTokenFrom.upload}`, methods:[Methods.GET, Methods.DELETE]},
        {route:`${Routes.csrf}${CsrfTokenFrom.settings}`, methods:[Methods.GET, Methods.DELETE]}
    ];

    const foundedProtectedRoute = protectedRoutes.find(
        (route) => (url.includes(route.route) && route.methods.includes(method))
    );
    if (foundedProtectedRoute) { return (foundedProtectedRoute); };

    return (undefined);
};

async function main(): Promise<void> {
    const client: pg.PoolClient = await pool.connect();
    if (!client) {
        throw new Error("Could not connect to the database");
    };

    const recoverCache = new RecoverCache();
    const transporter = new TransporterClass();
    if (!(await transporter.verifyTransporter())) {
        throw new Error("Could not connect to the mailing service");
    };

    const dependencies: CoreControllerConstructor = {
        client: client,
        transporter: transporter,
        recoverCache: recoverCache
    };

    const controller = new Controller(dependencies);
    const authController = new AuthController(dependencies);

    const PORT = process.env.SERVER_PORT || 8080;
    http.createServer()
    .on("request", (req, res) => { 
        const request = req;

        const { url, method, headers } = request;
        if ( !url || !method ) {
            const message = JSON.stringify({ message: "Bad Request" });
            res.writeHead(400, "Bad Request", {
                "Content-Length": Buffer.byteLength(message),
                "content-type": "application/json"
            })
            .end(message);
            return ;
        };

        const route = getRoute(url, method);
        const accessTokenFromHeaders = getAccessTokenFromHeaders(headers["authorization"]);

        if (route) { 
            if (accessTokenFromHeaders) {
                const fingerprint = getCookie(headers.cookie, "Secure-Fgp");
                if (!fingerprint) {
                    return (sendError(res, ErrorsEnum.Unauthorized));
                };

                const hashFingerPrint = createHash("sha256").update(Buffer.from(fingerprint, "hex")
                .toString("utf-8"))
                .digest("base64url");

                const decryptedAccessToken = cipherGenerator.deciphertoken( accessTokenFromHeaders );
                if (!decryptedAccessToken) {
                    return (sendError(res, ErrorsEnum.Server));
                };

                const readOnlyAccessToken = ReadOnlyAccessToken.fromString( decryptedAccessToken );
                if (readOnlyAccessToken.expiredToken()) {
                    res.writeHead(200, "Access token expired").end();
                    return ;
                } else if (!readOnlyAccessToken.valid( hashFingerPrint )) {
                    return (sendError(res, ErrorsEnum.Unauthorized));
                };
            } else {
                return (sendError(res, ErrorsEnum.Unauthorized));
            };
        };

        if (url.includes("/api/auth/")) {
            authController.routing(req, res, url);
        } else {
            controller.routing(req, res, url);
        };
    })
    .on("close", () => { console.log("Shutting down the server"); })
    .listen(PORT, () => { console.log(`Listening on port ${PORT}`); });

    setInterval(authController.intervalDeleteCsrfToken.bind(authController), 300000);
};

main()
.then(() => { console.log("Server successfully created!") })
.catch((err) => { console.error(err) });
