import { PoolClient } from "pg";

import { JwtToken } from "../utils/interfaces.js";
import { formattingSessionToken } from "../utils/formatting.js";

async function queryGetToken( 
    client:PoolClient, token:string
): Promise<Readonly<JwtToken | undefined>>
{
    const query = {
        text: "SELECT * FROM revoked_token \
        WHERE jwt_token_digest=$1",
        values: [token]
    };

    try {
        const res = await client.query(query);
        const { rows } = res;
        if (rows.length == 0) {
            return (undefined);
        };
        const sessionToken = formattingSessionToken(rows[0]);
    
        return (sessionToken);
    } catch (error) {
        console.error(error);
        return (undefined);
    };
};

async function queryAddToken( 
    client:PoolClient, token:string
): Promise<Readonly<boolean>>
{
    const query = {
        text: "INSERT INTO revoked_token (jwt_token_digest) VALUES($1) \
        RETURNING *",
        values: [token]
    };
    try {
        const res = await client.query(query);
        const { rows } = res;
        if (rows.length === 0) {
            return (false);
        };

        return (true);
    } catch (error) {
        console.error(error);
        return (false);
    }; 
};

/* async function queryDeleteAllTokens(
    client:PoolClient, token:string
): Promise<Readonly<JwtToken | undefined>>
{
    const query = {
        text: "SELECT session_token_id, session_token FROM session_token \
        WHERE session_token=$1",
        values: [token]
    };
    const res = await client.query(query);
    const { rows } = res;
    if (rows.length === 0)
        return (undefined);

    const sessionToken = formattingSessionToken(rows[0]);
    return (sessionToken);
}; */

export { queryGetToken, queryAddToken };