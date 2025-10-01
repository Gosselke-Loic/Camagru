import {
    scryptSync,
    randomBytes,
    createCipheriv,
    randomFillSync,
    createDecipheriv,
} from'node:crypto';

type TagArray = {
    [key: string]: Buffer;
};

class TokenCipher {
    private tag: TagArray = {};
    private salt = randomBytes(32);
    private iv = randomFillSync(new Uint8Array(16));
    private password = randomBytes(32).toString("hex");

    constructor() {}

    public cipherToken( token: string ): string | undefined  {
        const key = scryptSync(this.password, this.salt, 32);

        const cipher = createCipheriv("aes-256-gcm", key, this.iv);

        let encrypted = cipher.update(token, "utf-8", "hex");
        encrypted += cipher.final("hex");

        const tempTag = cipher.getAuthTag();

        this.tag[encrypted] = tempTag;

        return (encrypted);
    }

    public deciphertoken( encrypted: string ): string | undefined {
        const key = scryptSync(this.password, this.salt, 32);

        const decipher = createDecipheriv("aes-256-gcm", key, this.iv);

        const tag = this.tag[encrypted];
        if (tag) {
            decipher.setAuthTag(tag);
            let decrypted = decipher.update(encrypted, "hex", "utf-8");
            decrypted += decipher.final("utf8");

            return (decrypted);
        };

        return (undefined);
    }
}

const cipherGenerator = new TokenCipher();
Object.freeze(cipherGenerator);

export default cipherGenerator;