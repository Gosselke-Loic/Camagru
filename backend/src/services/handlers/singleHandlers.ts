import { QueryResult } from "pg";

import {
    UserToFront,
    LikeToFront,
    ImageToFront,
    CommentFromDatabase,
    GetCredentials
} from "../../utils/types.js";
import {
    formattingUsers,
    formattingLikes,
    formattingImages,
    formattingComments,
    formattingCredentials
} from "../../utils/formatting.js";

function handleSingleImage(
    res: QueryResult<any>
): Readonly<undefined | ImageToFront> {
    const { rows } = res;
    if (rows.length === 0)
        return (undefined);

    const images = formattingImages(rows);
    return (images[0] as ImageToFront);
};

function handleSingleUser(
    res: QueryResult<any>
): Readonly<undefined | UserToFront> {
    const { rows } = res;
    if (rows.length === 0)
        return (undefined);

    const users = formattingUsers(rows);
    return (users[0] as UserToFront);
};

function handleSingleLike(
    res: QueryResult<any>
): Readonly<undefined | LikeToFront> {
    const { rows } = res;
    if (rows.length === 0)
        return (undefined);

    const likes = formattingLikes(rows);
    return (likes[0] as LikeToFront);
};

function handleSingleComment(
    res: QueryResult<any>
): Readonly<undefined | CommentFromDatabase> {
    const { rows } = res;
    if (rows.length === 0)
        return (undefined);

    const comments = formattingComments(rows);
    return (comments[0] as CommentFromDatabase);
};

function handleCredentials(
    res: QueryResult<any>
): Readonly<undefined | GetCredentials> {
    const { rows } = res;
    if (rows.length === 0)
        return (undefined);

    return (formattingCredentials(rows[0]));
}

export {
    handleSingleLike,
    handleSingleUser,
    handleSingleImage,
    handleCredentials,
    handleSingleComment
};