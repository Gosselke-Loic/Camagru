import { QueryResult } from "pg";
import { ErrorsConfig } from "./interfaces.js";
import { CsrfTokenFrom, Routes } from "./enums.js";

const defaultOrigin = "http://localhost:2000";

const errors: ErrorsConfig = Object.freeze({
    "allow": {
        status: 405,
        message: "Method Not Allowed" 
    },
   "badRequest": {
        status: 400,
        message: "Bad Request"
    },
    "unauthorized": {
        status: 401,
        message: "Unauthorized"
    },
    "forbidden": {
        status: 403,
        message: "Forbidden"
    },
    "notFound": {
        status: 404,
        message: "Not Found"
    },
    "conflict": {
        status: 409,
        message: "Conflict"
    },
    "payloadTooLarge": {
        status: 413,
        message: "Payload Too Large"
    },
    "unsupportedMediatype": {
        status: 415,
        message: "Unsupported Media Type"
    },
    "server": {
        status: 500,
        message: "Internal Server Error"
    }
});

function getTotalOfImages(res: QueryResult<any>): number {
    const { rows } = res;
    
    const stringify = JSON.stringify(rows[0]);
    const count = JSON.parse(stringify);
    const numberOfImages = parseInt(count.count);
    if (isNaN(numberOfImages)) {
        return (0);
    };
    
    return (numberOfImages);
};

function getTotalOfLikes(res: QueryResult<any>): number {
    const { rows } = res;
    
    const stringify = JSON.stringify(rows[0]);
    const count = JSON.parse(stringify);
    const numberOfImages = parseInt(count.count);
    if (isNaN(numberOfImages)) {
        return (0);
    };
    
    return (numberOfImages);
};

function isLoggedInCsrfToken(url:string): boolean {
    if (url === `${Routes.csrf}${CsrfTokenFrom.post}` ||
        url === `${Routes.csrf}${CsrfTokenFrom.upload}` ||
        url === `${Routes.csrf}${CsrfTokenFrom.settings}`
    ) { return (true); }

    return (false);
};

export {
    errors,
    defaultOrigin,
    getTotalOfLikes,
    getTotalOfImages,
    isLoggedInCsrfToken
};