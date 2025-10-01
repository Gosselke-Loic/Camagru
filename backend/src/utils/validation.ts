import validator from "validator";
import { resolveMx } from "node:dns/promises";

function sanitizeInput(input: string): Readonly<string> {
    const trimed = validator.trim(input);
    const sanitized = validator.escape(trimed);
    return (sanitized);
};

function unsanitizeInput(input: string): Readonly<string> {
    return (validator.unescape(input));
};

async function validAndSanitizeEmail(email: string): Promise<Readonly<string | undefined>> {
    if (!email) {
        return (undefined);
    };

    let trimedEmail: string;
    try {
        trimedEmail = validator.trim(email);
    } catch {
        return (undefined);
    };
    
    if (trimedEmail === "" || trimedEmail.length > 255) {
        return (undefined);
    };  

    if (!validator.isEmail(trimedEmail.toLowerCase())) {
        return (undefined);
    };

    try {
        const resolved = await resolveMx(trimedEmail.split("@")[1]);
        if (!resolved) { return (undefined); };
    } catch (error) {
        console.error(error);
        return (undefined);
    };

    const normalizedEmail = validator.normalizeEmail(trimedEmail);
    if (!normalizedEmail) {
        return (undefined);
    };

    return (normalizedEmail);
};

function validAndSanitizeUsername(username: string): Readonly<string | undefined> {
    if (!username) {
        return (undefined);
    };

    let trimedUsername: string;
    try {
        trimedUsername = validator.trim(username);
    } catch {
        return (undefined);
    };

    if (trimedUsername === "" || trimedUsername.length > 32) {
        return (undefined);
    };
        
    if (!validator.isAscii(username)) {
        return (undefined);
    };    

    return (sanitizeInput(trimedUsername));
};

function validCode(code: number): Readonly<number | undefined> {
    if (!code) {
        return (undefined);
    };

    const stringCode = code.toString();
    if (stringCode.length !== 6) {
        return (undefined);
    };

    if (!validator.isNumeric(stringCode)) {
        return (undefined);
    };

    return (code);
};

function validPassword(password: string, regValidation = true): Readonly<string | undefined> {
    if (!password) {
        return (undefined);
    };

    let trimedPassword: string;
    try {
        trimedPassword = validator.trim(password);
    } catch {
        return (undefined);
    };

    if (trimedPassword === "" || trimedPassword.length > 32) {
        return (undefined);
    }; 

    if (regValidation) {
        const validationRegex = [
            { regex: /.{8,}/ }, // min 8 letters,
            { regex: /[0-9]/ }, // numbers from 0 - 9
            { regex: /[a-z]/ }, // letters from a - z (lowercase)
            { regex: /[A-Z]/ }, // letters from A-Z (uppercase),
            { regex: /[^A-Za-z0-9]/} // special characters
        ];
        for (const item of validationRegex) {
            if (!password.match(item.regex)) {
                return (undefined);
            };
        };
    };

    return (trimedPassword);
};

export {
    validCode,
    sanitizeInput,
    validPassword,
    unsanitizeInput,
    validAndSanitizeEmail,
    validAndSanitizeUsername
};