interface JwtHeader {
    agl: string,
    typ: string
};

interface JwtPayload {
    user_id: number,
    username: string,
    origin: string,
    nbf: number,
    exp: number,
    userFingerPrint?: string
};

export { JwtHeader, JwtPayload };