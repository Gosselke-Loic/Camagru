import { Buffer } from "node:buffer";
import { createHmac, createSecretKey, KeyObject } from "node:crypto";

import { defaultOrigin } from "../../utils/utils.js";
import { JwtHeader, JwtPayload } from "./interfaces.js";

export default class ReadOnlyAccessToken {
    private encodedHeader: string;
    private encodedPayload: string;
    private encodedSignature: string;

    private header: JwtHeader;
    private payload: JwtPayload;

    protected constructor( accessToken: string ) {
        const splitToken = accessToken.split('.');

        this.encodedHeader = splitToken[0];
        this.header = JSON.parse(Buffer.from(splitToken[0], "base64url").toString("utf-8"));

        this.encodedPayload = splitToken[1];
        this.payload = JSON.parse(Buffer.from(splitToken[1], "base64url").toString("utf-8"));

        this.encodedSignature = splitToken[2];
    }

    private get getHeader() {
        return (this.header);
    }

    private get getPayload() {
        return (this.payload);
    }

    private get getEncodedHeader() {
        return (this.encodedHeader);
    }

    private get getEncodedPayload() {
        return (this.encodedPayload);
    }

    private get getEncodedSignature() {
        return (this.encodedSignature);
    }

    public static fromString( accessTokenString: string ): ReadOnlyAccessToken {
        const readOnlyToken = new ReadOnlyAccessToken( accessTokenString );
        return ( readOnlyToken );
    }

    public valid( fingerString: string ): boolean {
        if ( this.getHeader.agl !== "HS256" ) {
            return (false);
        }

        const origin = process.env.ORIGIN ? process.env.ORIGIN : defaultOrigin;
        if ( this.getPayload.origin !== origin ) {
            return (false);
        }

        if ( this.getPayload.userFingerPrint && this.getPayload.userFingerPrint !== fingerString ) {
            return (false);
        }

        const secret = createSecretKey(Buffer.from(JSON.stringify(process.env.JWT_SECRET)));
        const toCompareSignature = createHmac("sha256", secret)
        .update(`${this.getEncodedHeader}.${this.getEncodedPayload}`)
        .digest();

        const encodedSignature = Buffer.from(toCompareSignature).toString("base64url");
        if (encodedSignature !== this.getEncodedSignature) {
            return (false);
        }

        return (true);
    }

    public expiredToken(): boolean {
        const now = new Date().getTime() / 1000;
        if ( now < this.payload.nbf || now > this.payload.exp ) {
            return (true);
        };

        return (false);
    }

    public getPublicPayload(): JwtPayload {
        return { ...this.getPayload };
    }
};