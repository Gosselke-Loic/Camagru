import { PoolClient } from "pg";

import { ValidationToken, CsrfTokenDatabase } from "../utils/interfaces.js";

async function queryGetAllValidationToken(
    client:PoolClient
): Promise<Readonly<ValidationToken[] | undefined>>
{
    const query = {
        text: "SELECT * FROM validation_token"
    };

    try {
        const res = await client.query(query);
        const { rows } = res;
        if (rows.length === 0) {
            return (undefined);
        };

        const tokens: ValidationToken[] = [];
            
        for (const row of rows) {
            const stringify = JSON.stringify(row);
            const parsedValidationToken = JSON.parse(stringify) as ValidationToken;

            const token = {
                validation_token : parsedValidationToken.validation_token,
                user_id: parsedValidationToken.user_id
            } satisfies ValidationToken;

            tokens.push(token);
        };

        return (tokens);
        
    } catch (error) {
        console.error(error);
        return (undefined);
    };
};

async function queryGetAllCsrfToken( 
    client:PoolClient
): Promise<Readonly<CsrfTokenDatabase[] | undefined>>
{
    const query = {
        text: "SELECT * FROM csrf_token"
    };

    try {
        const res = await client.query(query);
        const { rows } = res;
        if (rows.length == 0) {
            return (undefined);
        };

        const csrfTokens: CsrfTokenDatabase[] = [];

        for(const row of rows) {
            const stringify = JSON.stringify(row);
            const parsedCcsrfToken = JSON.parse(stringify) as CsrfTokenDatabase;

            const token = {
                csrf_token : parsedCcsrfToken.csrf_token,
                created_at: parsedCcsrfToken.created_at,
                expire_date: parsedCcsrfToken.expire_date,
                from_path: parsedCcsrfToken.from_path
            } satisfies CsrfTokenDatabase;

            csrfTokens.push(token);
        };

        return (csrfTokens);
    } catch (error) {
        console.error(error);
        return (undefined);
    };
};

export {queryGetAllValidationToken, queryGetAllCsrfToken};