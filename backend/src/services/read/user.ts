import { PoolClient } from "pg";

import { GetCredentials, UserToFront } from "../../utils/types.js";
import { handleMultipleUsers } from "../handlers/multipleHandlers.js";
import { handleCredentials, handleSingleUser } from "../handlers/singleHandlers.js";

async function queryGetUsers(
    client:PoolClient
): Promise<Readonly<UserToFront[]>>
{
    const query = {
        text: "SELECT user_id, email, username, verified, logged_in, mail_preference FROM c_user"
    };
    
    try {
        const res = await client.query(query);
        return (handleMultipleUsers(res));
    } catch (error) {
        console.error(error);
        return ([] as UserToFront[]);
    };
};

async function queryGetUser( 
    client:PoolClient,
    id:Readonly<number>
): Promise<Readonly<UserToFront | undefined>>
{
    const query = {
        text: "SELECT user_id, email, username, verified, logged_in, mail_preference FROM c_user \
        WHERE user_id=$1",
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

async function queryGetUserByUsername( 
    client:PoolClient, username:Readonly<string>
): Promise<Readonly<UserToFront | undefined>>
{
    const query = {
        text: "SELECT user_id, email, username, verified, logged_in, mail_preference FROM c_user \
        WHERE username=$1",
        values: [username]
    };

    try {
        const res = await client.query(query);
        return (handleSingleUser(res));
    } catch (error) {
        console.error(error);
        return (undefined);
    };
};

async function queryGetCredentialsByUsername( 
    client:PoolClient,
    username:Readonly<string>
): Promise<Readonly<GetCredentials | undefined>> 
{
    const query = {
        text: "SELECT user_id, password, salt, verified FROM c_user \
        WHERE username=$1",
        values: [username]
    };

    try {
        const res = await client.query(query);
        return (handleCredentials(res));
    } catch (error) {
        console.error(error);
        return (undefined);
    };
};

async function queryGetCredentialsByID( 
    client:PoolClient,
    userID:Readonly<number>
): Promise<Readonly<GetCredentials | undefined>> 
{
    const query = {
        text: "SELECT user_id, password, salt FROM c_user \
        WHERE user_id=$1",
        values: [userID]
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
    queryGetUser,
    queryGetUsers,
    queryGetUserByUsername,
    queryGetCredentialsByID,
    queryGetCredentialsByUsername
};