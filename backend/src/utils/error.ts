import { errors } from "./utils.js";
import { ServerResponse, IncomingMessage } from "node:http";

const sendError = (
    res:ServerResponse<IncomingMessage>,
    type:Readonly<string>,
    detail?:Readonly<string>
): void => {
    const object = errors[type];
    if (object) {

        const message = JSON.stringify({ message: detail ?? object.message });
        res.writeHead(object.status, object.message, {
            "content-length": Buffer.byteLength(message),
            "content-type": "application/json"
        })
        .end(message);
 
    } else {
        res.writeHead(500, "Internal Server Error").end();
    }
};

export default sendError;