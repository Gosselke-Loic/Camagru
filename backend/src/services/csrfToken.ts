import { PoolClient } from "pg";

import { CsrfTokenDatabase } from "../utils/interfaces.js";
import { formattingCsrfToken } from "../utils/formatting.js";

async function queryGetCsrfToken( 
    client:PoolClient, params:string[]
): Promise<Readonly<CsrfTokenDatabase | undefined>>
{
    const query = {
        text: "SELECT * FROM csrf_token \
        WHERE csrf_token=$1 AND \
        from_path=$2",
        values: [...params]
    };

    try {
        const res = await client.query(query);
        const { rows } = res;
        if (rows.length == 0) {
            return (undefined);
        };
        const csrfToken = formattingCsrfToken(rows[0]);
    
        return (csrfToken);
    } catch (error) {
        console.error(error);
        return (undefined);
    };
};

async function queryAddCsrfToken( 
    client:PoolClient, params:string[]
): Promise<Readonly<boolean>>
{
    const query = {
        text: "INSERT INTO csrf_token (csrf_token, from_path, expire_date, created_at) VALUES($1, $2, $3, $4) \
        RETURNING *",
        values: [...params]
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

async function queryDeleteCsrfToken(
    client: PoolClient,
    params:string[]
): Promise<Readonly<CsrfTokenDatabase | undefined>> {
    const query = {
        text: "DELETE FROM csrf_token \
        WHERE csrf_token=$1 AND \
        from_path=$2 \
        RETURNING *",
        values: [...params],
    };

    try {
        const res = await client.query(query);
        const { rows } = res;
        if (rows.length === 0) {
            return (undefined);
        };

        return (formattingCsrfToken(rows[0]));
    } catch (error) {
        console.error(error);
        return (undefined);
    };
};

async function queryDeleteExpiredCsrfToken(
    client: PoolClient
): Promise<void> {
    const now = ~~(new Date().getTime() / 1000);
    const query = {
        text: "DELETE FROM csrf_token \
        WHERE expire_date<=$1",
        values: [now],
    };

    try {
        await client.query(query);
    } catch (error) {
        console.error(error);
        return ;
    };
};

export {
    queryAddCsrfToken,
    queryGetCsrfToken,
    queryDeleteCsrfToken,
    queryDeleteExpiredCsrfToken
};