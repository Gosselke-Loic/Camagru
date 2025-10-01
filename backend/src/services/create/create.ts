import { PoolClient } from "pg";

import {
    LikeToFront,
    UserToFront,
    ImageToFront,
    CommentFromDatabase
} from "../../utils/types.js";
import {
    handleSingleLike,
    handleSingleUser,
    handleSingleImage,
    handleSingleComment
} from "../handlers/singleHandlers.js";

async function queryCreateUser(
    client:PoolClient,
    params:string[]
): Promise<Readonly<UserToFront | undefined>> {
    const query = {
        text: "INSERT INTO c_user (email, username, password, salt) VALUES($1, $2, $3, $4) \
        RETURNING user_id, email, username, verified, logged_in",
        values: [...params]
    };

    try {
        const res = await client.query(query);
        return (handleSingleUser(res));
    } catch (error) {
        console.error(error);
        return (undefined);
    };
};

async function queryCreateImage(
    client:PoolClient,
    params:string[]
): Promise<Readonly<ImageToFront| undefined >> {
    const query = {
        text: "INSERT INTO c_image (href, original_file_name, user_id) VALUES($1, $2, $3) \
        RETURNING image_id, href, original_file_name, created_at, user_id",
        values: [...params]
    };

    try {
        const res = await client.query(query);
        return (handleSingleImage(res));
    } catch (error) {
        console.error(error);
        return (undefined);
    };
};

async function queryCreateLike(
    client:PoolClient,
    params:string[]
): Promise<Readonly<LikeToFront | undefined>> {
    const query = {
        text: "INSERT INTO c_like (user_id, image_id) VALUES($1, $2) \
        RETURNING like_id, user_id",
        values: [...params]
    };

    try {
        const res = await client.query(query);
        return (handleSingleLike(res));
    } catch (error) {
        console.error(error);
        return (undefined);
    };
};

async function queryCreateComment(
    client:PoolClient,
    params:string[]
): Promise<Readonly<CommentFromDatabase | undefined>> {
    const query = {
        text: "INSERT INTO c_comment (content, user_id, image_id) VALUES($1, $2, $3) \
        RETURNING comment_id, content, created_at, user_id, image_id",
        values: [...params]
    };

    try {
        const res = await client.query(query);
        return (handleSingleComment(res));
    } catch (error) {
        console.error(error);
        return (undefined);
    };
};

export {
    queryCreateUser,
    queryCreateLike,
    queryCreateImage,
    queryCreateComment
};