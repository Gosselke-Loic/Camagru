import { PoolClient } from "pg";

import { CommentFromDatabase } from "../../utils/types.js";
import { handleSingleComment } from "../handlers/singleHandlers.js";
import { handleMultipleComments } from "../handlers/multipleHandlers.js";

async function queryGetComment(
    client: PoolClient,
    userID: number,
    imageID: number,
): Promise<Readonly<CommentFromDatabase | undefined>> {
    const query = {
        text: "SELECT comment_id, content, created_at, user_id FROM c_comment \
        WHERE user_id=$1 \
        AND image_id=$2",
        values: [userID, imageID]
    };

    try {
        const res = await client.query(query);
        return (handleSingleComment(res));
    } catch (error) {
        console.error(error);
        return (undefined);
    };
};

async function queryGetComments(
    client: PoolClient
): Promise<Readonly<CommentFromDatabase[]>> {
    const query = { text: "SELECT comment_id, content, created_at, user_id FROM c_comment" };

    try {
        const res = await client.query(query);
        return (handleMultipleComments(res));
    } catch (error) {
        console.error(error);
        return ([] as CommentFromDatabase[]);
    };
};

async function queryGetCommentsFromImage(
    client: PoolClient,
    imageID: number,
): Promise<Readonly<CommentFromDatabase[]>> {
    const query = {
        text: "SELECT comment_id, content, created_at, user_id FROM c_comment \
        WHERE image_id=$1",
        values: [imageID]
    };

    try {
        const res = await client.query(query);
        return (handleMultipleComments(res));
    } catch (error) {
        console.error(error);
        return ([] as CommentFromDatabase[]);
    };
};

export { queryGetComment, queryGetComments, queryGetCommentsFromImage };