import { PoolClient } from "pg";
import { randomBytes } from "node:crypto";
import { ServerResponse, IncomingMessage } from "node:http";

import sendError from "../utils/error.js";
import { ErrorsEnum } from "../utils/enums.js";
import { getCookie } from "../utils/cookies.js";
import RecoverCache from "../recover/RecoverCache.js";
import { queryAddToken } from "../services/jwtToken.js";
import { queryGetImage } from "../services/read/image.js";
import TransporterClass from "../transporter/Transporter.js";
import { UserToFront, ValueOrFalse } from "../utils/types.js";
import { getAccessTokenFromHeaders } from "../utils/headers.js";
import { queryUpdateLoggedIn } from "../services/update/user.js";
import cipherGenerator from "../tokens/tokenCipher/TokenCipher.js";
import { CoreControllerConstructor } from "../utils/interfaces.js";
import ReadOnlyAccessToken from "../tokens/jwt/ReadOnlyAccessToken.js";
import { queryGetUser, queryGetUserByUsername } from "../services/read/user.js";
import { CsrfTokenIsExpired, switchCaseCsrfTokenFrom } from "../tokens/csrf/csrfTokenUtils.js";
import { queryAddCsrfToken, queryDeleteCsrfToken, queryGetCsrfToken } from "../services/csrfToken.js";

import { queryGetAllCsrfToken } from "../services/showAll.js";

export default class CoreController {
    private url: string;
    private client: PoolClient;
    private body: string | undefined;
    private request: IncomingMessage;
    private response: ServerResponse;
    private recoverCache: RecoverCache;
    private transporter: TransporterClass;

    constructor (dependencies: CoreControllerConstructor) {
        this.url = "";
        this.body = undefined;
        this.client = dependencies.client;
        this.request = <IncomingMessage>{};
        this.response = <ServerResponse>{};
        this.transporter = dependencies.transporter;
        this.recoverCache = dependencies.recoverCache;
    };

    /*  */

    protected get getUrl(): string {
        return (this.url);
    };

    protected get getClient(): PoolClient {
        return (this.client);
    };

    protected get getBody(): string | undefined {
        return (this.body);
    };

    protected get getResponse(): ServerResponse {
        return (this.response);
    };

    protected get getRequest(): IncomingMessage {
        return (this.request);
    };

    protected get getRecoverCache(): RecoverCache {
        return (this.recoverCache);
    };
        
    protected get getTransporter(): TransporterClass {
        return (this.transporter);
    }

    /*  */

    protected set setBody( body: string ) {
        this.body = body;
    };

    protected set setUrl( url: string ) {
        this.url = url
    };

    protected set setRequest( request: IncomingMessage ) {
        this.request = request;
    };

    protected set setResponse( response: ServerResponse ) {
        this.response = response;
    };

    protected async findUserByID(
        id:Readonly<number>
    ): Promise<ValueOrFalse<UserToFront>> {
        const user = await queryGetUser(this.client, id);
        if (!user) {
            return (false);
        };

        return (user);
    };

    protected async findUserByUsername(
        username:Readonly<string>
    ): Promise<ValueOrFalse<UserToFront>> {
        const user = await queryGetUserByUsername(this.client, username);
        if (!user) {
            return (false);
        };

        return (user);
    };

    protected async findUserByImageID(
        id:number
    ): Promise<Promise<ValueOrFalse<UserToFront>>> {
        const image = await queryGetImage(this.getClient, id);
        if (!image) {
            return (false);
        };

        return (this.findUserByID(image.user_id));
    };

    protected getRawAccessToken(): string {
        const { headers } = this.getRequest;
        const accessTokenFromHeaders = getAccessTokenFromHeaders(headers["authorization"]) as string;

        return (accessTokenFromHeaders);
    }

    protected getReadOnlyAccessToken(): undefined | Readonly<ReadOnlyAccessToken> {
        const { headers } = this.getRequest;

        const accessTokenFromHeaders = getAccessTokenFromHeaders(headers["authorization"]);
        if (!accessTokenFromHeaders) {
            sendError(this.getResponse, ErrorsEnum.Unauthorized);
            return (undefined);
        };
        const decryptedAccessToken = cipherGenerator.deciphertoken( accessTokenFromHeaders );
        if (!decryptedAccessToken) {
            sendError(this.getResponse, ErrorsEnum.Server);
            return (undefined);
        };

        const readOnlyAccessToken = ReadOnlyAccessToken.fromString( decryptedAccessToken );

        return (readOnlyAccessToken);
    };

    protected getFingerprintCookie(): Readonly<string | undefined> {
        const { headers } = this.getRequest;
        return (getCookie(headers.cookie, "Secure-Fgp"));
    };

    protected async logoutUser(
        id: number,
        accessToken:string
    ): Promise<void> {
        await queryAddToken(this.getClient, accessToken);
        await queryUpdateLoggedIn(this.getClient, id, false);
    };

    protected async generateCsrfToken(
        client:PoolClient,
        from:string
    ): Promise<Readonly<ValueOrFalse<string>>> {
        const csrfToken = randomBytes(32)
        .toString("hex")
        .slice(0, 32);

        const now = new Date();
        const fiveMinutes = (5*60);
        const expire_date = ~~((now.getTime() / 1000) + fiveMinutes);

        const createdAt = ~~(now.getTime() / 1000);
        const queryResponse = await queryAddCsrfToken(client,
            [csrfToken, from, expire_date.toString(), createdAt.toString()]
        );
        if (!queryResponse) { return (false); };

        return (csrfToken);
    };

    protected async csrfTokenIsValid(from: string): Promise<Readonly<ValueOrFalse<string>>> {
        const { headers } = this.getRequest;
        const csrfToken = headers["x-csrftoken"];

        if (!csrfToken || Array.isArray(csrfToken) ) {
            sendError(this.getResponse, ErrorsEnum.BadRquest);
            return (false);
        };

        const checkedFrom = switchCaseCsrfTokenFrom(from);
        if (checkedFrom === "") {
            sendError(this.getResponse, ErrorsEnum.BadRquest);
            return (false);
        };

        const csrfTokenFounded = await queryGetCsrfToken(this.getClient,
            [csrfToken, from]
        );
        if (!csrfTokenFounded) { 
            sendError(this.getResponse, ErrorsEnum.NotFound);
            return (false);
        } else if (CsrfTokenIsExpired(csrfTokenFounded)) {
            sendError(this.getResponse, ErrorsEnum.Unauthorized);
            return (false);
        };

        return (csrfTokenFounded.csrf_token);
    };

    protected async removeCsrfTokenFromDatabase(csrfToken: string, from:string): Promise<void> {
        await queryDeleteCsrfToken(this.getClient, [csrfToken, from]);
    }
}