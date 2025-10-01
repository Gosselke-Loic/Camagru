import { UserCredentials } from "./types.js";
import { randomBytes, pbkdf2Sync } from "node:crypto";

function generatePassword(password: string): Readonly<UserCredentials | undefined> {
    try {
        const salt = randomBytes(64).toString("hex");
        const genHash = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
        return (
            {
                salt: salt,
                password: genHash
            } as Readonly<UserCredentials>
        );
    } catch (error) {
        return (undefined);
    };
};

function comparingPassword(
    password: string,
    hash: string,
    salt: string
): boolean {
    const hashToCompare = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    return (hash === hashToCompare);
};

export { generatePassword, comparingPassword };