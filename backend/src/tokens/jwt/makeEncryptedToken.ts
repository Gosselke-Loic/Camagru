import generateToken from "./generateAccessToken.js";
import cipherGenerator from "../tokenCipher/TokenCipher.js";

const makeEncryptedToken = (
    userInfo: { username:string, id:number },
    expiredTime: number,
    userFingerPrint: string
): string | undefined => {
    const token = generateToken(
        userInfo.id,
        userInfo.username,
        expiredTime
    );
    token.setCustomClaim("userFingerPrint", userFingerPrint);
    const encodedToken = token.encode();

    const encryptedToken = cipherGenerator.cipherToken( encodedToken );
    if ( !encryptedToken ) {
        return (undefined);
    };
    
    return (encryptedToken);
};

export default makeEncryptedToken;