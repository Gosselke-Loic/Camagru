import { PoolClient } from "pg";

import { UpdatedUser, UserToFront } from "../../utils/types.js";
import { handleCredentials, handleSingleUser } from "../handlers/singleHandlers.js";

async function queryUpdateUser(
    client:PoolClient,
    id: number,
    params: any[]
): Promise<UpdatedUser | undefined> {
    const query = {
        text: "UPDATE c_user \
        SET email=COALESCE($2, email), \
        username=COALESCE($3, username), \
        password=COALESCE($4, password), \
        salt=COALESCE($5, salt), \
        mail_preference=COALESCE($6, mail_preference), \
        updated_at=DEFAULT \
        WHERE user_id=$1 \
        RETURNING user_id, email, username, password, salt, verified, logged_in, mail_preference",
        values: [id, ...params]
    };

    try {
        const res = await client.query(query);
        const { rows } = res;
        if (rows.length === 0) {
            return (undefined);
        };   

        const stringify = JSON.stringify(rows[0]);
        const parsedUser = JSON.parse(stringify) as UpdatedUser;

        const user = {
            user_id: parsedUser.user_id,
            email: parsedUser.email,
            username: parsedUser.username,
            password: parsedUser.password,
            salt: parsedUser.salt,
            verified: parsedUser.verified,
            logged_in: parsedUser.logged_in,
            mail_preference: parsedUser.mail_preference
        } satisfies UpdatedUser;

        return (user);
    } catch (error) {
        console.error(error);
        return (undefined);
    }
};

async function queryUpdateVerifiedUser(
    client:PoolClient, id:number
): Promise<Readonly<UserToFront | undefined>>
{
    const query = {
        text: "UPDATE c_user \
        SET verified=true, \
        updated_at=DEFAULT \
        WHERE user_id=$1 \
        RETURNING user_id, email, username, verified, logged_in, mail_preference",
        values: [id]
    };

    try {
        const res = await client.query(query);
        return (handleSingleUser(res));
    } catch (error) {
        console.error(error);
        return (undefined);
    };
};

async function queryUpdateLoggedIn(
    client:PoolClient, id: number, logged_in: boolean
): Promise<Readonly<UserToFront | undefined>>
{
    const log: string = logged_in ? "true" : "false";
    const query = {
        text: "UPDATE c_user \
        SET logged_in=$2, \
        updated_at=DEFAULT \
        WHERE user_id=$1 \
        RETURNING user_id, email, username, verified, logged_in, mail_preference",
        values: [id, log]
    };

    try {
        const res = await client.query(query);
        return (handleSingleUser(res));
    } catch (error) {
        console.error(error);
        return (undefined);
    };
};

async function queryUpdateCredentialsUser(client:PoolClient, id: number, params: any[]){
    const query = {
        text: "UPDATE c_user \
        SET password=$1, \
        salt=$2, \
        updated_at=DEFAULT \
        WHERE user_id=$3 \
        RETURNING user_id, password, salt",
        values: [...params, id]
    };

    try {
        const res = await client.query(query);
        return (handleCredentials(res));
    } catch (error) {
        console.error(error);
        return (undefined);
    };
};

export {
    queryUpdateUser,
    queryUpdateLoggedIn,
    queryUpdateVerifiedUser,
    queryUpdateCredentialsUser
};