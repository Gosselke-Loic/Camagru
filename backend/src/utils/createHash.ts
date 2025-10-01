import { createHash } from "crypto";

const createHashSHA256 = (payload:string): string => {
    return (createHash("sha256")
    .update(payload)
    .digest("hex"));
};

export default createHashSHA256;