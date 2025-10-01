import { PoolClient } from "pg";

import { ImageToFront } from "../../utils/types.js";
import { getTotalOfImages } from "../../utils/utils.js";
import { handleSingleImage } from "../handlers/singleHandlers.js";
import { handleMultipleImages } from "../handlers/multipleHandlers.js";

async function queryGetImage(
    client: PoolClient,
    imageID: number
): Promise<Readonly<ImageToFront | undefined>> {
    const query = {
        text: "SELECT * FROM c_image \
        WHERE image_id=$1",
        values: [imageID]
    };

    try {
        const res = await client.query(query);
        return (handleSingleImage(res));
    } catch (error) {
        console.error(error);
        return (undefined);
    };
};

async function queryGetImages(
    client: PoolClient
): Promise<Readonly<ImageToFront[] | undefined>> {
    const query = {
        text: "SELECT * FROM c_image \
        ORDER BY created_at DESC"
    };

    try {
        const res = await client.query(query);
        return (handleMultipleImages(res));
    } catch (error) {
        console.error(error);
        return (undefined);
    };
};

async function queryGetPaginationImages(
    client: PoolClient,
    currentPage: number
): Promise<Readonly<ImageToFront[]>> {
    const offset = (currentPage * 5) - 5;
    const query = {
        text: "SELECT * FROM c_image \
        ORDER BY created_at DESC \
        OFFSET $1 \
        LIMIT 5",
        values: [offset]
    };

    try {
        const res = await client.query(query);
        return (handleMultipleImages(res));
    } catch (error) {
        console.error(error);
        return ([] as ImageToFront[]);
    };
};

async function queryGetImagesFromUser(
    client: PoolClient,
    userID: number
): Promise<Readonly<ImageToFront[]>> {
    const query = {
        text: "SELECT * FROM c_image \
        WHERE user_id=$1 \
        ORDER BY created_at DESC",
        values: [userID]
    };

    try {
        const res = await client.query(query);
        return (handleMultipleImages(res));
    } catch (error) {
        console.error(error);
        return ([] as ImageToFront[]);
    };
};

async function queryGetRecentsImageFromUser(
    client: PoolClient,
    userID: number,
    limit: number
): Promise<Readonly<ImageToFront[]>> {
    const query = {
        text: "SELECT * FROM c_image \
        WHERE user_id=$1 \
        ORDER BY created_at DESC \
        LIMIT $2",
        values: [userID, limit]
    };

    try {
        const res = await client.query(query);
        return (handleMultipleImages(res));
    } catch (error) {
        console.error(error);
        return ([] as ImageToFront[]);
    };
};

async function queryGetTotalImages(
    client: PoolClient
): Promise<Readonly<number>> {
    const query = {
        text: "SELECT COUNT(image_id) \
        FROM c_image"
    };

    try {
        const res = await client.query(query);
        return (getTotalOfImages(res));
    } catch (error) {
        console.error(error);
        return (0);
    };
};

export {
    queryGetImage,
    queryGetImages,
    queryGetTotalImages,
    queryGetImagesFromUser,
    queryGetPaginationImages,
    queryGetRecentsImageFromUser
};