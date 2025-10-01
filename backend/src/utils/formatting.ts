import {
    LikeToFront,
    UserToFront,
    ImageToFront,
    GetCredentials,
    CommentFromDatabase
} from "./types.js";
import {
    JwtToken,
    ValidationToken,
    CsrfTokenDatabase
} from "./interfaces.js";

function formattingUsers(
    rows: any[]
): UserToFront[] {   
    const users: UserToFront[] = [];
    for (const row of rows) {
        const stringify = JSON.stringify(row);
        const parsedUser = JSON.parse(stringify) as UserToFront;

        const user = {
            user_id: parsedUser.user_id,
            email: parsedUser.email,
            username: parsedUser.username,
            verified: parsedUser.verified,
            logged_in: parsedUser.logged_in,
            mail_preference: parsedUser.mail_preference
        } satisfies UserToFront;
        users.push(user);
    };
 
    return (users as UserToFront[]);
};

function formattingImages(
    rows: any[]
): ImageToFront[] {
    const images: ImageToFront[] = [];
    for (const row of rows) {
        const stringify = JSON.stringify(row);
        const parsedImages = JSON.parse(stringify) as ImageToFront;

        const image = {
            image_id: parsedImages.image_id,
            href: parsedImages.href,
            original_file_name: parsedImages.original_file_name,
            user_id: parsedImages.user_id
        } satisfies ImageToFront;
        images.push(image);
    };

    return (images as ImageToFront[]);
};

function formattingCredentials(row: GetCredentials): GetCredentials {
    const credentials = {
        user_id : row.user_id,
        verified: row.verified,
        password: row.password,
        salt: row.salt,
    } satisfies GetCredentials;

    return (credentials);
};

function formattingSessionToken(row: JwtToken): JwtToken {
    const token = {
        jwt_token_digest : row.jwt_token_digest,
        revocation_date: row.revocation_date
    } satisfies JwtToken;

    return (token);
};

function formattingCsrfToken(row: CsrfTokenDatabase): CsrfTokenDatabase {
    const stringify = JSON.stringify(row);
    const parsedCcsrfToken = JSON.parse(stringify) as CsrfTokenDatabase;

    const token = {
        csrf_token : parsedCcsrfToken.csrf_token,
        created_at: parsedCcsrfToken.created_at,
        expire_date: parsedCcsrfToken.expire_date,
        from_path: parsedCcsrfToken.from_path
    } satisfies CsrfTokenDatabase;

    return (token);
};

function formattingValidationToken(row: ValidationToken): ValidationToken {
    const stringify = JSON.stringify(row);
    const parsedValidationToken = JSON.parse(stringify) as ValidationToken;

    const token = {
        validation_token : parsedValidationToken.validation_token,
        user_id: parsedValidationToken.user_id
    } satisfies ValidationToken;

    return (token);
};

function formattingLikes(
    rows: any[],
): LikeToFront[] {
    const likes: LikeToFront[] = [];
    for (const row of rows) {
        const stringify = JSON.stringify(row);
        const parsedLike = JSON.parse(stringify) as LikeToFront;

        const like = {
            like_id: parsedLike.like_id,
            user_id: parsedLike.user_id
        } satisfies LikeToFront;
        likes.push(like);
    };

    return (likes as LikeToFront[]);
};

function formattingComments(
    rows: any[],
): CommentFromDatabase[] {
    const comments: CommentFromDatabase[] = [];
    for (const row of rows) {
        const stringify = JSON.stringify(row);
        const parsedComment = JSON.parse(stringify) as CommentFromDatabase;

        const formatDate = parsedComment.created_at as string;
        const finalDate = formatDate.split("T")[0];
        const comment = {
            comment_id: parsedComment.comment_id,
            content: parsedComment.content,
            created_at: finalDate,
            user_id: parsedComment.user_id
        } satisfies CommentFromDatabase;
        comments.push(comment);
    };

    return (comments as CommentFromDatabase[]);
};

export {
    formattingUsers,
    formattingLikes,
    formattingImages,
    formattingComments,
    formattingCsrfToken,
    formattingCredentials,
    formattingSessionToken,
    formattingValidationToken
};