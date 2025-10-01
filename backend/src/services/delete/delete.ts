import { PoolClient } from "pg";

import { ImageToFront, LikeToFront } from "../../utils/types.js";
import { handleSingleImage, handleSingleLike } from "../handlers/singleHandlers.js";

async function queryDeleteImage(
    client: PoolClient,
    imageID: number,
    userID: number,
): Promise<Readonly<ImageToFront | undefined>> {
    const query = {
        text: "DELETE FROM c_image \
        WHERE image_id=$1 \
        AND user_id=$2 \
        RETURNING *",
        values: [imageID, userID],
    };

    try {
        const res = await client.query(query);
        return (handleSingleImage(res));
    } catch (error) {
        console.error(error);
        return (undefined);
    };  
};

async function queryDeleteLike(
    client: PoolClient,
    likeID: number,
    userID: number
): Promise<Readonly<LikeToFront | undefined>> {
    const query = {
        text: "DELETE FROM c_like \
        WHERE like_id=$1 \
        AND user_id=$2 \
        RETURNING *",
        values: [likeID, userID],
    };

    try {
        const res = await client.query(query);
        return (handleSingleLike(res));
    } catch (error) {
        console.error(error);
        return (undefined);
    };
};

export { queryDeleteLike, queryDeleteImage };