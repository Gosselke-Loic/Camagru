import { PoolClient } from "pg";

import { ValidationToken } from "../utils/interfaces.js";
import { formattingValidationToken } from "../utils/formatting.js";

async function queryGetValidationToken( 
    client:PoolClient, token:string
): Promise<Readonly<ValidationToken | undefined>>
{
    const query = {
        text: "SELECT * FROM validation_token \
        WHERE validation_token=$1",
        values: [token]
    };

    try {
        const res = await client.query(query);
        const { rows } = res;
        if (rows.length === 0) {
            return (undefined);
        };
            
        return (formattingValidationToken(rows[0]));
    } catch (error) {
        console.error(error);
        return (undefined);
    };

};

async function queryAddValidationToken( 
    client:PoolClient, params:string[]
): Promise<Readonly<boolean>>
{
    const query = {
        text: "INSERT INTO validation_token (validation_token, user_id) VALUES($1, $2) \
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

async function queryDeleteValidationToken(
    client: PoolClient,
    token: string
): Promise<Readonly<ValidationToken | undefined>> {
    const query = {
        text: "DELETE FROM validation_token \
        WHERE validation_token=$1 \
        RETURNING *",
        values: [token],
    };

    try {
        const res = await client.query(query);
        const { rows } = res;
        if (rows.length === 0) {
            return (undefined);
        };

        return (formattingValidationToken(rows[0]));
    } catch (error) {
        console.error(error);
        return (undefined);
    };
};

export {
    queryGetValidationToken,
    queryAddValidationToken,
    queryDeleteValidationToken
};