import { PoolClient } from "pg";

import { LikeToFront } from "../../utils/types.js";
import { getTotalOfLikes } from "../../utils/utils.js";
import { handleSingleLike } from "../handlers/singleHandlers.js";
import { handleMultipleLikes } from "../handlers/multipleHandlers.js";

async function queryGetLike(
    client: PoolClient,
    userID: number,
    imageID: number,
): Promise<Readonly<LikeToFront | undefined>> {
    const query = {
        text: "SELECT like_id, user_id FROM c_like \
        WHERE user_id=$1 \
        AND image_id=$2",
        values: [userID, imageID]
    };

    try {
        const res = await client.query(query);
        return (handleSingleLike(res));
    } catch (error) {
        console.error(error);
        return (undefined);
    };
};

async function queryGetLikes(
    client: PoolClient,
): Promise<Readonly<LikeToFront[]>> {
    const query = { text: "SELECT like_id, user_id FROM c_like" };
    
    try {
        const res = await client.query(query);
        return (handleMultipleLikes(res));
    } catch (error) {
        console.error(error);
        return ([] as LikeToFront[]);
    };
};

async function queryGetLikesFromImage(
    client: PoolClient,
    imageID: number,
): Promise<Readonly<LikeToFront[]>> {
    const query = {
        text: "SELECT like_id, user_id FROM c_like \
        WHERE image_id=$1",
        values: [imageID]
    };

    try {
        const res = await client.query(query);
        return (handleMultipleLikes(res));
    } catch (error) {
        console.error(error);
        return ([] as LikeToFront[]);
    };
};

async function queryGetLikesFromImageAndUser(
    client: PoolClient,
    params: string[],
): Promise<Readonly<LikeToFront[]>> {
    const query = {
        text: "SELECT like_id, user_id FROM c_like \
        WHERE image_id=$1 \
        AND user_id=$2",
        values: [...params]
    };

    try {
        const res = await client.query(query);
        return (handleMultipleLikes(res));
    } catch (error) {
        console.error(error);
        return ([] as LikeToFront[]);
    };
};

async function queryGetTotalLikes(
    client: PoolClient,
    imageID: string
): Promise<Readonly<number>> {
    const query = {
        text: "SELECT COUNT(like_id) \
        FROM c_like \
        WHERE image_id=$1",
        values: [imageID]
    };

    try {
        const res = await client.query(query);
        return (getTotalOfLikes(res));
    } catch (error) {
        console.error(error);
        return (0);
    };
};

export {
    queryGetLike,
    queryGetLikes,
    queryGetTotalLikes,
    queryGetLikesFromImage,
    queryGetLikesFromImageAndUser
};