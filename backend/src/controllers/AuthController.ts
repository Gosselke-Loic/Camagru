import { Buffer } from "node:buffer";
import { createHash, randomBytes } from "node:crypto";
import { ServerResponse, IncomingMessage } from "node:http";

import {
    UserToFront,
    LoginInfoBody,
    RecoverBodyInfo,
    UserCredentials,
    PostUserInfoBody,
    RecoveryPostPayload
} from "../utils/types.js";
import {
    Routes,
    Methods,
    ErrorsEnum,
    CsrfTokenFrom,
} from "../utils/enums.js";
import {
    validCode,
    validPassword,
    unsanitizeInput,
    validAndSanitizeEmail,
    validAndSanitizeUsername
} from "../utils/validation.js";
import {
    queryUpdateLoggedIn,
    queryUpdateVerifiedUser,
    queryUpdateCredentialsUser
} from "../services/update/user.js";
import {
    queryAddValidationToken,
    queryDeleteValidationToken,
    queryGetValidationToken
} from "../services/validationToken.js";
import sendError from "../utils/error.js";
import { getCookie } from "../utils/cookies.js";
import CoreController from "./CoreController.js";
import createHashSHA256 from "../utils/createHash.js";
import { queryCreateUser } from "../services/create/create.js";
import { getAccessTokenFromHeaders } from "../utils/headers.js";
import { CoreControllerConstructor } from "../utils/interfaces.js";
import { queryGetAllValidationToken } from "../services/showAll.js";
import makeEncryptedToken from "../tokens/jwt/makeEncryptedToken.js";
import { queryDeleteExpiredCsrfToken } from "../services/csrfToken.js";
import { queryGetCredentialsByUsername } from "../services/read/user.js";
import { switchCaseCsrfTokenFrom } from "../tokens/csrf/csrfTokenUtils.js";
import { comparingPassword, generatePassword } from "../utils/password.js";

class AuthController extends CoreController {

    constructor (dependencies: CoreControllerConstructor) {
        super(dependencies);
    }

    /* --- */

    public routing(
        request:IncomingMessage,
        response:ServerResponse<IncomingMessage>,
        url: Readonly<string>
    ) {
        this.setUrl = url;
        this.setRequest = request;
        this.setResponse = response;

        const { method, headers } = this.getRequest;
        if ( !method ) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        switch (method) {
            case Methods.GET:
                this.get();
                break ;
            case Methods.POST:
            case Methods.PATCH:
                const contentTypeHeader = headers["content-type"];
                if ( !contentTypeHeader ) {
                    return (sendError(this.getResponse, ErrorsEnum.BadRquest));
                } else if ( contentTypeHeader !== "application/json") {
                    return (sendError(this.getResponse, ErrorsEnum.UnsupportedMediaType));
                };

                let tempBody: any[] = [];
                this.getRequest.on("data", (chunk) => {
                    tempBody.push(chunk);
                })
                .on("end", () => {
                    this.setBody = Buffer.concat(tempBody).toString();
                    if ( method === Methods.POST ) {
                        this.post();
                    } else if ( method === Methods.PATCH ) {
                        this.patch();
                    };
                });
                break ;
            default:
                return (sendError(this.getResponse, ErrorsEnum.Allow));
        };
    }

    /* --- */

    private get(): void {
        const url: Readonly<string> = this.getUrl;
        switch (true) {
            case url.includes(Routes.csrf):
                this.makeCsrfToken(url);
                break ;
            case url.includes(Routes.verificationMail):
                this.verifyEmail(url);
                break ;
            case url.includes(Routes.access):
                this.checkAccessGranted();
                break ;
            default:
                return (sendError(this.getResponse, ErrorsEnum.NotFound));
        };
    }

    private post(): void {
        const url: Readonly<string> = this.getUrl;
        switch (true) {
            case url === Routes.logout:
                this.standartLogout();
                break ;
            case url === Routes.silentLogout:
                this.silentLogout();
                break ;
            case url === Routes.register:
                this.register();
                break ;
            case url === Routes.login:
                this.login();
                break ;
            case url.includes(Routes.sendRecovery):
                this.sendRecoveryMail();
                break ;
            default:
                return (sendError(this.getResponse, ErrorsEnum.NotFound));
        };
    }

    private patch(): void {
        const url: Readonly<string> = this.getUrl;
        if (url === Routes.recovery) {
            this.recoveryPassword();
        } else {
            return (sendError(this.getResponse, ErrorsEnum.NotFound));
        };
    }

    /* --- */

    private async makeCsrfToken(url:Readonly<string>): Promise<void> {

        const from: Readonly<string> = url.split('=')[1];
        if (!from) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const checkedFrom = switchCaseCsrfTokenFrom(from);
        if (checkedFrom === "") {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const csrfToken = await this.generateCsrfToken(this.getClient, checkedFrom);
        if (!csrfToken) {
            return (sendError(this.getResponse, ErrorsEnum.Server));
        };

        const stringifyToken = JSON.stringify({
            "csrfToken": `${csrfToken}`
        });
        this.getResponse.writeHead(200, {
            "Content-Length": Buffer.byteLength(stringifyToken),
            "content-type": "application/json"
        })
        .end(stringifyToken);
    }

    private async sendRecoveryMail(): Promise<void> {
        const csrfTokenFounded = await this.csrfTokenIsValid(CsrfTokenFrom.login);
        if (!csrfTokenFounded) {
            return ;
        };

        if (!this.getBody) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };
            
        const body = JSON.parse(this.getBody) as Readonly<RecoverBodyInfo>;
        if (!body) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const { username } = body;
        if ( !username ) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const findedUser = await this.findUserByUsername(username);
        if (!findedUser) {
            return (sendError(this.getResponse, ErrorsEnum.NotFound));
        };

        const generatedCode = this.getRecoverCache.generateRecoverCode(findedUser.username);
        if (!generatedCode) {
            return (sendError(this.getResponse, ErrorsEnum.Server));
        };

        this.getTransporter.sendMail({
            from: process.env.TRANSPORTER_USER,
            to: findedUser.email,
            subject: "Recovery code for Camgaru",
            text: "Here's your recovery code!",
            html: `<h3>Here's your recovery code!</h3> \
                <h4> ${generatedCode} </h4> \
                <p>You can use this code to reset your password using the following link.</p> \
                <a href="http://localhost:2000/recovery">Change your password</a> \
                <p>Automatically generated message, do not reply.</p>`
        });

        await this.removeCsrfTokenFromDatabase(csrfTokenFounded, CsrfTokenFrom.login);

        this.getResponse.writeHead(204, "No Content").end();
    }

    private async recoveryPassword(): Promise<void>{
        const csrfTokenFounded = await this.csrfTokenIsValid(CsrfTokenFrom.recovery);
        if (!csrfTokenFounded) {
            return ;
        };

        if (!this.getBody) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };
            
        const body = JSON.parse(this.getBody) as Readonly<RecoveryPostPayload>;
        if (!body) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const { code, username, password } = body;
        if ( !code || !username || !password ) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const validatedInputs = {
            code: validCode(code),
            username: validAndSanitizeUsername(username),
            password: validPassword(password)
        };
        if (!validatedInputs.code || !validatedInputs.username || !validatedInputs.password) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const validRecoveryCode = this.getRecoverCache.validRecoverCode(code, username);
        if (!validRecoveryCode) {
            return (sendError(this.getResponse, ErrorsEnum.Unauthorized));
        };

        const findedUser = await this.findUserByUsername(username);
        if (!findedUser) {
            return (sendError(this.getResponse, ErrorsEnum.NotFound));
        };

        const newCredentials: Readonly<UserCredentials | undefined> = generatePassword(password);
        if (!newCredentials) {
            return (sendError(this.getResponse, ErrorsEnum.Server));
        };

        const updatedUser = await queryUpdateCredentialsUser(
            this.getClient,
            findedUser.user_id,
            [newCredentials.password,newCredentials.salt]
        );

        if (!updatedUser) {
            return (sendError(this.getResponse, ErrorsEnum.Conflict));
        };

        await this.removeCsrfTokenFromDatabase(csrfTokenFounded, CsrfTokenFrom.recovery);

        const stringRecovery = JSON.stringify({
            "message": "Password sucessfully recovered",
        });
        this.getResponse.writeHead(200, {
            "Content-Length": Buffer.byteLength(stringRecovery),
            "content-type": "application/json"
        })
        .end(stringRecovery);
    }

    private async verifyEmail(url: Readonly<string>): Promise<void> {
        const token: Readonly<string> = url.split('=')[1];
        if (!token) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const validationEmailInsert = await queryGetValidationToken(this.getClient, token);
        if (!validationEmailInsert) {
            return (sendError(this.getResponse, ErrorsEnum.NotFound));
        };

        const updatedUser = await queryUpdateVerifiedUser(this.getClient, validationEmailInsert.user_id);
        if (!updatedUser) {
            return (sendError(this.getResponse, ErrorsEnum.Conflict));
        };

        await queryDeleteValidationToken(this.getClient, validationEmailInsert.validation_token);
        
        // console.log("verify email validation tokens list: ", await queryGetAllValidationToken(this.getClient));

        // console.log("verify email validation users: ", await queryGetUsers(this.getClient));

        this.getResponse.writeHead(200, {
            "content-type": "text/html"
        })
        .end(
            `<br> \
            <h1> Your email was successfully verified! </h1> <br> \
            <a href="http://localhost:2000/">Returning to home</a>`
        );
    }

    private async checkAccessGranted(): Promise<void> {

        const { headers } = this.getRequest;

        const accessToken = getAccessTokenFromHeaders(headers["authorization"]);
        if (!accessToken) {
            return (sendError(this.getResponse, ErrorsEnum.Unauthorized));
        };

        const fingerprint = getCookie(headers.cookie, "Secure-Fgp");
        if (!fingerprint) {
            return (sendError(this.getResponse, ErrorsEnum.Unauthorized));
        };

        this.getResponse.writeHead(200, "OK").end();
    }

    public async intervalDeleteCsrfToken(): Promise<void> {
        await queryDeleteExpiredCsrfToken(this.getClient);
    }

    /* --- */

    private async register(): Promise<void> {
        const csrfTokenFounded = await this.csrfTokenIsValid(CsrfTokenFrom.register);
        if (!csrfTokenFounded) {
            return ;
        };

        if (!this.getBody) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };   

        const body = JSON.parse(this.getBody) as Readonly<PostUserInfoBody>;
        if (!body) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };  

        const { email, username, password } = body;
        if ( !email || !username || !password ) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const validateInputs = {
            email: await validAndSanitizeEmail(email),
            username: validAndSanitizeUsername(username),
            password: validPassword(password)
        };
        if ( !validateInputs.email || !validateInputs.username || !validateInputs.password ) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const hash: Readonly<UserCredentials | undefined> = generatePassword(validateInputs.password);
        if (!hash) {
            return (sendError(this.getResponse, ErrorsEnum.Server));
        };
        
        const newUser = await queryCreateUser(
            this.getClient, 
            [
                validateInputs.email,
                validateInputs.username,
                hash.password,
                hash.salt
            ]
        );
        if (!newUser) {
            return (sendError(this.getResponse, ErrorsEnum.Conflict));
        };

        const hashValidationEmail = createHashSHA256(randomBytes(12).toString("hex"));

        const newValidationEmailInsert = await queryAddValidationToken(this.getClient,
            [
                hashValidationEmail,
                newUser.user_id.toString()
            ]
        );
        if (!newValidationEmailInsert) {
            return (sendError(this.getResponse, ErrorsEnum.Server));
        };

        this.getTransporter.sendMail({
            from: process.env.TRANSPORTER_USER,
            to: newUser.email,
            subject: "New account on Camgaru",
            text: "Your account in Camgaru has been successfully created!",
            html: `<h3>Your account in Camgaru has been successfully created!</h3> \
                <p>Please click into the following link to validate your email account</p> \
                <a href="http://localhost:2000/api/auth/verify-email?token=${hashValidationEmail}">Validate your Email</a> \
                <p>Automatically generated message, do not reply.</p>`
        });

        await this.removeCsrfTokenFromDatabase(csrfTokenFounded, CsrfTokenFrom.register);

        const stringUser = JSON.stringify({
            "message": "New user created"
        });
        this.getResponse.writeHead(201, {
            "Content-Length": Buffer.byteLength(stringUser),
            "content-type": "application/json"
        })
        .end(stringUser);
    }

    private async login(): Promise<void> {
        const csrfTokenFounded = await this.csrfTokenIsValid(CsrfTokenFrom.login);
        if (!csrfTokenFounded) {
            return ;
        };

        if (!this.getBody) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };
            
        const body = JSON.parse(this.getBody) as Readonly<LoginInfoBody>;
        if (!body) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const { username, password } = body;
        if ( !username || !password ) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const validatedInputs = {
            username: validAndSanitizeUsername(username),
            password: validPassword(password)
        };
        if ( !validatedInputs.username || !validatedInputs.password ) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const userCredentials = await queryGetCredentialsByUsername(this.getClient, validatedInputs.username);
        if (!userCredentials) {
            return (sendError(this.getResponse, ErrorsEnum.NotFound));
        };

        if (!userCredentials.verified) {
            return (sendError(this.getResponse, ErrorsEnum.Forbidden));
        };

        if (!comparingPassword(validatedInputs.password, userCredentials.password, userCredentials.salt)) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const userLoggedIn = await queryUpdateLoggedIn(this.getClient, userCredentials.user_id, true);
        if (!userLoggedIn || userLoggedIn.logged_in !== true) {
            return (sendError(this.getResponse, ErrorsEnum.Conflict));
        };

        const bufferFingerPrint = randomBytes(32);
        const hashFingerPrint = createHash("sha256").update(bufferFingerPrint.toString("utf-8"))
        .digest("base64url");

        const encryptedAccessToken = makeEncryptedToken(
            { username: userLoggedIn.username, id: userLoggedIn.user_id },
            (60*60), // 1 hour
            hashFingerPrint
        );
        if ( !encryptedAccessToken ) {
            return (sendError(this.getResponse, ErrorsEnum.Server));
        }

        await this.removeCsrfTokenFromDatabase(csrfTokenFounded, CsrfTokenFrom.login);

        const user = {
            user_id: userLoggedIn.user_id,
            email: userLoggedIn.email,
            username: unsanitizeInput(userLoggedIn.username),
            verified: userLoggedIn.verified,
            logged_in: userLoggedIn.logged_in,
            mail_preference: userLoggedIn.mail_preference
        } satisfies UserToFront;

        const stringifyUser = JSON.stringify({
            message: "Successfully Logged in",
            accessToken: encryptedAccessToken,
            user: user
        });

        const hexUserFingerPrint = bufferFingerPrint.toString("hex");
        this.getResponse.writeHead(200, {
            "set-cookie": [`Secure-Fgp=${hexUserFingerPrint}; SameSite=Strict; Max-Age=3600; Path=/api; HttpOnly; Secure`],
            "Content-Length": Buffer.byteLength(stringifyUser),
            "content-type": "application/json"
        })
        .end(stringifyUser);
    }

    private async logout(): Promise<boolean> {
        const readOnlyAccessToken = this.getReadOnlyAccessToken();
        if (!readOnlyAccessToken) {
            return (false);
        };

        const rawAccessToken = this.getRawAccessToken();

        const payload = readOnlyAccessToken.getPublicPayload();
        await this.logoutUser(payload.user_id, rawAccessToken);

        return (true);
    }

    private async silentLogout(): Promise<void> {
        const fingerprint = this.getFingerprintCookie();
        if (!fingerprint) {
            sendError(this.getResponse, ErrorsEnum.Unauthorized);
            return ;
        };

        if (await this.logout()) {
            const logoutResponse = JSON.stringify({
                message: "Access token expired, logged out"
            });
            this.getResponse.writeHead(200, {
                "set-cookie": [`Secure-Fgp=${fingerprint}; SameSite=Strict; Max-Age=0; Path=/api; HttpOnly; Secure`],
                "content-length": Buffer.byteLength(logoutResponse),
                "content-type": "application/json"
            })
            .end(logoutResponse);
        };
    }

    private async standartLogout(): Promise<void> {
        const fingerprint = this.getFingerprintCookie();
        if (!fingerprint) {
            sendError(this.getResponse, ErrorsEnum.Unauthorized);
            return ;
        };

        if (await this.logout()) {
            const logoutResponse = JSON.stringify({
                message: "Successfully logged out"
            });
            this.getResponse.writeHead(200, {
                "set-cookie": [`Secure-Fgp=${fingerprint}; SameSite=Strict; Max-Age=0; Path=/api; HttpOnly; Secure`],
                "content-length": Buffer.byteLength(logoutResponse),
                "content-type": "application/json"
            })
            .end(logoutResponse);
        };
    } 
}

export default AuthController;