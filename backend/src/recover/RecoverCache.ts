import { randomInt } from "node:crypto";

import { ValueOrFalse } from "../utils/types.js";
import { RecoveryCode } from "../utils/interfaces.js";

export default class RecoverCache {
    #codes: RecoveryCode[] = [];

    constructor() {};

    private get getCodes() {
        return (this.#codes);
    }

    private pushCode(recoverCode:RecoveryCode) {
        this.#codes.push(recoverCode);
    }

    generateRecoverCode(username: Readonly<string>): ValueOrFalse<number> {
        try {
            const code = randomInt(100000, 999999);
            
            const now = new Date();
            const fiveMinutes = 5*60;
            const recoverCode: RecoveryCode = {
                code: code,
                username: username,
                createdAt: ~~(now.getTime() / 1000),
                expireAt: ~~((now.getTime() / 1000) + fiveMinutes)
            };

            this.pushCode(recoverCode);

            return (code);
        } catch {
            return (false);
        };
    }

    validRecoverCode(code:Readonly<number>, username:Readonly<string>): boolean {
        const codes = this.getCodes;

        for (const [index, item] of codes.entries()) {
            if (item.code == code && item.username === username) {
                this.getCodes.splice(index, 1);

                const now = ~~(new Date().getTime() / 1000);
                if ( now < item.createdAt || now > item.expireAt ) {
                    return (false);
                };

                return (true);
            };
        };

        return (false);
    }
}