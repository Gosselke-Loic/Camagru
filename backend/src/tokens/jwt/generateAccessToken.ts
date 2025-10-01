import { Buffer } from "node:buffer";
import { createHmac, createSecretKey, KeyObject } from "node:crypto";

import { defaultOrigin } from "../../utils/utils.js";
import { JwtHeader, JwtPayload } from "./interfaces.js";

class Token {
    private customClaims: Record<string, string> = {};

    public constructor(
        private header: JwtHeader,
        private payload: JwtPayload,
        private secret: KeyObject,
    ) {}

    private get getHeader() {
        return (this.header);
    }

    private get getSecret() {
        return (this.secret);
    }

    private get getPayload() {
        return (this.payload);
    }

    private get getCustomClaims() {
        return (this.customClaims);
    }

    public setCustomClaim(key:string, value:string): void {
        if (this.getPayload.hasOwnProperty(key) || key === "jti") {
            throw Error(`Cannot add claim with reserver keyword ${key}`);
        }
        this.getCustomClaims[key] = value; 
    }

    public encode(): string {
        const encodedHeader = Buffer.from(JSON.stringify(this.getHeader)).toString("base64url");

        const fullPayload = { ...this.getPayload, ...this.getCustomClaims };
        const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");

        const signature = createHmac("sha256", this.getSecret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest();

        const encodedSignature = signature.toString("base64url");

        return (`${encodedHeader}.${encodedPayload}.${encodedSignature}`);
    }
};

function generateToken( user_id:number, name:string, timeExpirationInSeconds:number ): Token {
    const now = new Date();
    const origin = process.env.ORIGIN ? process.env.ORIGIN : defaultOrigin;
    const secret = createSecretKey(Buffer.from(JSON.stringify(process.env.JWT_SECRET)));

    return (new Token(
        {
            agl: "HS256",
            typ: "JWT"
        },
        {
            user_id: user_id,
            username: name,
            origin: origin,
            nbf: ~~(now.getTime() / 1000),
            exp: ~~((now.getTime() / 1000) + timeExpirationInSeconds)
        },
        secret
    ));
};

export default generateToken;