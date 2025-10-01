import { Image, User, Like, Comment } from "./interfaces.js";

/* User */

type RecoverBodyInfo = Pick<User, "username">;
type UserCredentials = Pick<User, "password" | "salt">;
type LoginInfoBody = Pick<User, "username" | "password">;
type GetCredentials = Pick<User, "user_id" | "password" | "salt" | "verified">;
type PostUserInfoBody = Pick<User, "email" | "username" | "password">;
type CreateUser = Pick<User, "email" | "username" | "password" | "salt" | "role">;
type UserToFront = Pick<User, "user_id" | "email" | "username" | "verified" | "logged_in" | "mail_preference">;

type UpdatedUser = UserToFront & Pick<User, "password" | "salt">;
type PatchUser = Pick<User, "email" | "username" | "mail_preference"> & { oldPassword:string, newPassword:string };

/* Image */

type ImageToFront = Omit<Image, "created_at">;
type UploadedImage = Pick<Image, "href" | "original_file_name">;
type PostImageInfobody = Pick <Image, "href" | "original_file_name" | "user_id">;

/* Like */

type LikeToFront = Omit<Like, "image_id">;
type PostLikeBody = Omit<Like, "like_id">;

/* Comments */

type CommentFromDatabase = Omit<Comment, "image_id">;
type PostCommentBody = Pick<Comment, "content" | "image_id" | "user_id">;
type CommentToFront = Pick<Comment, "comment_id" | "content" | "created_at"> & Pick<User, "username">;

/* Other */
type ValueOrFalse<T> = T | false;
type RecoveryPostPayload = { code: number } & Pick<User, "password" | "username">;

export {
    PatchUser,
    CreateUser,
    UpdatedUser,
    LikeToFront,
    UserToFront,
    ValueOrFalse,
    PostLikeBody,
    ImageToFront,
    LoginInfoBody,
    UploadedImage,
    GetCredentials,
    CommentToFront,
    RecoverBodyInfo,
    PostCommentBody,
    UserCredentials,
    PostUserInfoBody,
    PostImageInfobody,
    RecoveryPostPayload,
    CommentFromDatabase
};