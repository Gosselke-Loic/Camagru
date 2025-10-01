import { QueryResult } from "pg";

import { 
    UserToFront,
    LikeToFront,
    ImageToFront,
    CommentFromDatabase
} from "../../utils/types.js";
import {
    formattingUsers,
    formattingLikes,
    formattingImages,
    formattingComments
} from "../../utils/formatting.js";

function handleMultipleUsers(
    res: QueryResult<any>
): Readonly<UserToFront[]> {
    const { rows } = res;
    if (rows.length === 0) {
        return ([] as UserToFront[]);
    };

    const users = formattingUsers(rows);
    return (users as UserToFront[]);
};

function handleMultipleImages(
    res: QueryResult<any>
): Readonly<ImageToFront[]> {
    const { rows } = res;
    if (rows.length === 0) {
        return ([] as ImageToFront[]);
    };

    const images = formattingImages(rows);
    return (images as ImageToFront[]);
};

function handleMultipleLikes(
    res: QueryResult<any>
): Readonly<LikeToFront[]> {
    const { rows } = res;
    if (rows.length === 0) {
        return ([] as LikeToFront[]);
    };

    const likes = formattingLikes(rows);
    return (likes as LikeToFront[]);
};

function handleMultipleComments(
    res: QueryResult<any>
): Readonly<CommentFromDatabase[]> {
    const { rows } = res;
    if (rows.length === 0) {
        return ([] as CommentFromDatabase[]);
    };

    const comments = formattingComments(rows);
    return (comments as CommentFromDatabase[]);
};

export { 
    handleMultipleUsers,
    handleMultipleLikes,
    handleMultipleImages,
    handleMultipleComments
};