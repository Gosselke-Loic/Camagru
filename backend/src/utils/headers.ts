const getAccessTokenFromHeaders = ( authorization: string | undefined ): string | undefined => {
    if (!authorization) {
        return (undefined);
    };

    const authorizationArray = authorization.split(" ");
    if (authorizationArray[0] !== "bearer" || !authorizationArray[1]) {
        return (undefined);
    };

    return (authorizationArray[1].trim());
};

export { getAccessTokenFromHeaders };