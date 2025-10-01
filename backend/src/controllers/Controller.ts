import sharp from "sharp";
import formidable from "formidable";
import { Buffer } from "node:buffer";
import { randomBytes } from "node:crypto";
import { copyFile, unlink } from "node:fs/promises";
import { ServerResponse, IncomingMessage } from "node:http";

import {
    Routes,
    Methods,
    ErrorsEnum,
    CsrfTokenFrom,
    UploadDirectory
} from "../utils/enums.js";
import {
    PatchUser,
    UserToFront,
    ImageToFront,
    PostLikeBody,
    UploadedImage,
    CommentToFront,
    UserCredentials,
    PostCommentBody,
    CommentFromDatabase,
    LikeToFront
} from "../utils/types.js";
import {
    sanitizeInput,
    validPassword,
    validAndSanitizeEmail,
    validAndSanitizeUsername,
    unsanitizeInput
} from "../utils/validation.js";
import {
    queryGetUser,
    queryGetUsers,
    queryGetCredentialsByID
} from "../services/read/user.js";
import {
    queryGetImage,
    queryGetTotalImages,
    queryGetImagesFromUser,
    queryGetPaginationImages,
    queryGetRecentsImageFromUser
} from "../services/read/image.js";
import {
    queryCreateLike,
    queryCreateImage,
    queryCreateComment
} from "../services/create/create.js";
import sendError from "../utils/error.js";
import CoreController from "./CoreController.js";
import { queryUpdateUser } from "../services/update/user.js";
import { queryGetLikesFromImage, queryGetLikesFromImageAndUser, queryGetTotalLikes } from "../services/read/like.js";
import { queryGetCommentsFromImage } from "../services/read/comment.js";
import { comparingPassword, generatePassword } from "../utils/password.js";
import { queryDeleteImage, queryDeleteLike } from "../services/delete/delete.js";
import { CoreControllerConstructor, UploadFinalImage } from "../utils/interfaces.js";

// To rmeove
import { queryGetAllCsrfToken } from "../services/showAll.js";

class Controller extends CoreController {

    constructor (dependencies: CoreControllerConstructor) {
        super(dependencies);
    }

    /* --- */

    public routing(
        request:IncomingMessage,
        response:ServerResponse<IncomingMessage>,
        url: Readonly<string>
    ) {
        this.setUrl = url;
        this.setRequest = request;
        this.setResponse = response;

        const { method, headers } = this.getRequest;
        if ( !method ) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        switch (method) {
            case Methods.GET:
                this.get();
                break;
            case Methods.DELETE:
                this.delete();
                break;
            case Methods.POST:
            case Methods.PATCH:
                const contentTypeHeader = headers["content-type"];
                if ( !contentTypeHeader ) {
                    return (sendError(this.getResponse, ErrorsEnum.BadRquest));
                } else if ( contentTypeHeader !== "application/json"
                    && !contentTypeHeader.includes("multipart/form-data")
                ) {
                    return (sendError(this.getResponse, ErrorsEnum.UnsupportedMediaType));
                };

                if (url === `${Routes.image}?type=sample`) {
                    this.uploadSample( request );
                    return ;
                };

                let tempBody: any[] = [];
                this.getRequest.on("data", (chunk) => {
                    tempBody.push(chunk);
                })
                .on("end", () => {
                    this.setBody = Buffer.concat(tempBody).toString();
                    if ( method === Methods.POST ) {
                        this.post();
                    } else if ( method === Methods.PATCH ) {
                        this.patch();
                    };
                });
                break;
            default:
                sendError(this.getResponse, ErrorsEnum.Allow);
                break;
        }
    }

    /* --- */

    private get() {
        const url: Readonly<string> = this.getUrl;
        if (url.match(/\/api\/([a-z]+)\/([0-9]+)/)) {
            const id = parseInt(url.split('/')[3]);
            if (Number.isNaN(id))
                return (sendError(this.getResponse, ErrorsEnum.BadRquest));
            switch (true) {
                case url.includes(`${Routes.user}/`):
                    this.getUser(id);
                    break ;
                case url.includes(`${Routes.image}/`):
                    this.getImage(id);
                    break ;
                case url.includes(`${Routes.like}/`):
                    // Future add
                    break ;
                case url.includes(`${Routes.comment}/`):
                    // Future add
                    break ;
                default:
                    sendError(this.getResponse, ErrorsEnum.NotFound);
                    break ;
            };
        } else {
            switch (true) {
                case url === Routes.user:
                    this.getUsers();
                    break ;
                case url === Routes.image:
                case url.includes(`${Routes.image}?page=`):
                case url.includes(`${Routes.image}?user=`):
                    this.getImages(url);
                    break ;
                case url === Routes.like:
                case url.includes(`${Routes.like}?image=`):
                    this.getLikes(url);
                    break ;
                case url === Routes.comment:
                case url.includes(`${Routes.comment}?image=`):
                    this.getComments(url);
                    break ;
                default:
                    sendError(this.getResponse, ErrorsEnum.NotFound);
                    break ;
            };
        }
    }

    private post(): void {
        const url: Readonly<string> = this.getUrl;
        switch (true) {
            case url === Routes.like:
                this.postLike();
                break ;
            case url === Routes.image:
                this.postImage();
                break ;
            case url === Routes.comment:
                this.postComment();
                break ;
            default:
                sendError(this.getResponse, ErrorsEnum.NotFound);
                break ;
        };
    }

    private patch() {
        const url: Readonly<string> = this.getUrl;
        if (url.match(/\/api\/([a-z]+)\/([0-9]+)/)) {
            const id = parseInt(url.split('/')[3]);
            if (Number.isNaN(id)) {
                return (sendError(this.getResponse, ErrorsEnum.BadRquest));
            };
            switch (true) {
                case url.includes(`${Routes.user}/`):
                    this.patchUser(id);
                    break;
                default:
                    sendError(this.getResponse, ErrorsEnum.NotFound);
                    break;
            };
        } else {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };
    }

    private delete() {
        const url: Readonly<string> = this.getUrl;
        if (url.match(/\/api\/([a-z]+)\/([0-9]+)/)) {
            const id = parseInt(url.split('/')[3]);
            if (Number.isNaN(id)) {
                return (sendError(this.getResponse, ErrorsEnum.BadRquest));
            };
            switch (true) {
                case url.includes(`${Routes.like}/`):
                    this.deleteLike(id);
                    break ;
                case url.includes(`${Routes.image}/`):
                    this.deleteImage(id);
                    break ;
                default:
                    sendError(this.getResponse, ErrorsEnum.NotFound);
                    break ;
            };
        } else {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };
    }

    /* --- */

    private async formatComments(
        comments: Readonly<CommentFromDatabase[]>
    ): Promise<CommentToFront[]> {
        if (!comments) {
            return ([]);
        };

        const formattedComments: CommentToFront[] = [];
        for (const comment of comments) {
            const user = await this.findUserByID(comment.user_id);
            if (!user) { continue ; };

            const newComment: CommentToFront = {
                username: user.username,
                comment_id: comment.comment_id,
                created_at: comment.created_at,
                content: unsanitizeInput(comment.content)
            } satisfies CommentToFront;
            formattedComments.push(newComment);
        };

        return (formattedComments);
    }

    private async uploadImages(req: IncomingMessage, directory: string): Promise<UploadedImage | number> {
        const form = formidable({
            uploadDir: directory,
            keepExtensions: false,
            allowEmptyFiles: false
        });

        try {
            const [ _fields , files ] = await form.parse(req);
            const file = files.file;

            if (file) {
                const maxSize = 8 * 1024 * 1024;
                if (file[0].size > maxSize) {
                    await unlink(`./${file[0].newFilename}`);
                    return (-2);
                }
                const fileName = file[0].newFilename;
                const originalName = file[0].originalFilename ? file[0].originalFilename : fileName;

                const image: UploadedImage = {
                    href: fileName,
                    original_file_name: originalName
                };

                return (image);
            };

            return (-1);
        } catch (err) {
            console.error(err);
            return (-3);
        }
    }

    /* GET users */

    private async getUser(id: number): Promise<void> {
        const user = await queryGetUser(this.getClient, id);
        if (!user) {
            return (sendError(this.getResponse, ErrorsEnum.NotFound));
        };

        const stringUser = JSON.stringify({
            user: user
        });
        this.getResponse.writeHead(200, {
            "content-length": Buffer.byteLength(stringUser),
            "content-type": "application/json"
        })
        .end(stringUser);
    }

    private async getUsers(): Promise<void> {
        const users = await queryGetUsers(this.getClient);
        if (!users) {
            return (sendError(this.getResponse, ErrorsEnum.NotFound));
        };

        const stringUsers = JSON.stringify({
            users: users
        });
        this.getResponse.writeHead(200, {
            "content-length": Buffer.byteLength(stringUsers),
            "content-type": "application/json"
        })
        .end(stringUsers);
    }

    /* GET images */

    private async getImage(id:number): Promise<void> {
        const image = await queryGetImage(this.getClient, id);
        if (!image) {
            return (sendError(this.getResponse, ErrorsEnum.NotFound));
        };

        const stringImage = JSON.stringify({
            image: image
        });
        this.getResponse.writeHead(200, {
            "content-length": Buffer.byteLength(stringImage),
            "content-type": "application/json"
        })
        .end(stringImage);
    }

    private async getImages(url:Readonly<string>): Promise<void> {
        let stringifydata: string = "";
        
        if (url.includes(`${Routes.image}?page=`)) {

            const stringPageNumber = url.split('=')[1];
            const pageNumber = parseInt(stringPageNumber);
            if (isNaN(pageNumber)) {
                return (sendError(this.getResponse, ErrorsEnum.BadRquest));
            };

            const images = await queryGetPaginationImages(this.getClient, pageNumber);
            const totalImages = await queryGetTotalImages(this.getClient);

            stringifydata = JSON.stringify({
                total: totalImages,
                images: images
            });

        } else if (url.includes(`${Routes.image}?user=`)) {

            const uriConfig: string = url.split('?')[1];
            const uriConfigParts: string[] = uriConfig.split("&");

            if (!uriConfigParts[0]) {
                return (sendError(this.getResponse, ErrorsEnum.BadRquest));
            };

            const userID = parseInt(uriConfigParts[0].split("=")[1]);
            if (isNaN(userID)) {
                return (sendError(this.getResponse, ErrorsEnum.BadRquest));
            };

            let images: Readonly<ImageToFront[] | undefined>;
            if (uriConfigParts[1]) {
                const limit = parseInt(uriConfigParts[1].split("=")[1]);
                if (isNaN(limit)) {
                    return (sendError(this.getResponse, ErrorsEnum.BadRquest));
                };

                images = await queryGetRecentsImageFromUser(this.getClient, userID, limit);
            } else {
                images = await queryGetImagesFromUser(this.getClient, userID);
            };

            stringifydata = JSON.stringify({
                images: images
            });

        } else {
            // Future, send all images
            return (sendError(this.getResponse, ErrorsEnum.NotFound));
        };

        if (stringifydata === "") {
            return (sendError(this.getResponse, ErrorsEnum.NotFound));
        };
        
        this.getResponse.writeHead(200, {
            "content-length": Buffer.byteLength(stringifydata),
            "content-type": "application/json"
        })
        .end(stringifydata);
    }

    /* GET likes */

    //private async getLike(): Promise<void> {}

    private async getLikes(url:string): Promise<void> {

        if (url.includes(`${Routes.like}?image=`)) {

            const uriConfig: string = url.split('?')[1];
            const uriConfigParts: string[] = uriConfig.split("&");

            if (!uriConfigParts[0]) {
                return (sendError(this.getResponse, ErrorsEnum.BadRquest));
            };

            const imageID = parseInt(uriConfigParts[0].split("=")[1]);
            if (isNaN(imageID)) {
                return (sendError(this.getResponse, ErrorsEnum.BadRquest));
            };

            const total = await queryGetTotalLikes(this.getClient, imageID.toString());
            if (uriConfigParts[1]) {

                const userID = parseInt(uriConfigParts[1].split("=")[1]);
                if (isNaN(userID)) {
                    return (sendError(this.getResponse, ErrorsEnum.BadRquest));
                };

                const likes = await queryGetLikesFromImageAndUser(
                    this.getClient, [imageID.toString(), userID.toString()]
                );

                const stringifydata = JSON.stringify({likes: likes, total: total});
                this.getResponse.writeHead(200, {
                    "content-length": Buffer.byteLength(stringifydata),
                    "content-type": "application/json"
                })
                .end(stringifydata);
                return ;

            } else {

                const likes = await queryGetLikesFromImage(this.getClient, imageID);

                const stringifydata = JSON.stringify({likes: likes, total: total});
                this.getResponse.writeHead(200, {
                    "content-length": Buffer.byteLength(stringifydata),
                    "content-type": "application/json"
                })
                .end(stringifydata);
                return ;

            };

        } else {
            // Future, send all likes from all images
            return (sendError(this.getResponse, ErrorsEnum.NotFound));
        };

    }

    /* GET comments */

    //private async getComment(): Promise<void> {}

    private async getComments(url:string): Promise<void> {
        let stringifydata: string = "";

        if (url.includes(`${Routes.comment}?image=`)) {

            const stringImageID = this.getUrl.split('=')[1];
            const imageID = parseInt(stringImageID);
            if (isNaN(imageID)) {
                return (sendError(this.getResponse, ErrorsEnum.BadRquest));
            };

            const comments = await queryGetCommentsFromImage(this.getClient, imageID);
            const formattedComments = await this.formatComments(comments);

            stringifydata = JSON.stringify({
                comments: formattedComments
            });

        } else {
            // Future, send all comments
            return (sendError(this.getResponse, ErrorsEnum.NotFound));
        };

        if (stringifydata === "") {
            return (sendError(this.getResponse, ErrorsEnum.NotFound));
        };

        this.getResponse.writeHead(200, {
            "content-length": Buffer.byteLength(stringifydata),
            "content-type": "application/json"
        })
        .end(stringifydata);
    }

    /* POST image, like, comment */

    private async postImage(): Promise<void> {
        const csrfTokenFounded = await this.csrfTokenIsValid(CsrfTokenFrom.upload);
        if (!csrfTokenFounded) {
            return ;
        };

        if (!this.getBody) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const body = JSON.parse(this.getBody) as Readonly<UploadFinalImage>;
        if (!body) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const { href, original_file_name, sticker } = body;
        if ( !href || !original_file_name || !sticker ||
            href.length > 255 || original_file_name.length > 255
        ) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const sanitizedInputs = {
            href: sanitizeInput(href),
            original_file_name: sanitizeInput(original_file_name),
            sticker: sanitizeInput(sticker)
        };

        const readOnlyAccessToken = this.getReadOnlyAccessToken();
        if (!readOnlyAccessToken) { return ; };

        const payload = readOnlyAccessToken.getPublicPayload();

        const imageName = `${payload.username}_${randomBytes(12)
        .toString("hex")
        .slice(0, 12)}`;

        try {

            await sharp(`./samples/${sanitizedInputs.href}`)
            .composite([ {input: `./uploads/stickers/${sanitizedInputs.sticker}`, blend: "over"} ])
            .toFile(imageName);

            await copyFile(`./${imageName}`, `./uploads/${imageName}`);
            await unlink(`./${imageName}`);
            
        } catch (error) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        console.log("here001");

        const newImage = await queryCreateImage(this.getClient,
            [imageName, sanitizedInputs.original_file_name, payload.user_id.toString()]
        );
        if (!newImage) { return (sendError(this.getResponse, ErrorsEnum.Conflict)); };

        const stringImage = JSON.stringify({
            "message": "New image successfuly uploaded"
        });
        this.getResponse.writeHead(201, {
            "Content-Length": Buffer.byteLength(stringImage),
            "content-type": "application/json"
        })
        .end(stringImage);
    }

    private async postLike(): Promise<void> {
        const csrfTokenFounded = await this.csrfTokenIsValid(CsrfTokenFrom.post);
        if (!csrfTokenFounded) {
            return ;
        };

        if (!this.getBody) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const body = JSON.parse(this.getBody) as Readonly<PostLikeBody>;
        if (!body) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const { image_id } = body;
        if (!image_id) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        if (Number.isNaN(image_id)) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const readOnlyAccessToken = this.getReadOnlyAccessToken();
        if (!readOnlyAccessToken) { return ; };

        const payload = readOnlyAccessToken.getPublicPayload();

        const postedLike = await queryCreateLike(
            this.getClient, [payload.user_id.toString(), image_id.toString()] 
        );
        if (!postedLike) {
            return (sendError(this.getResponse, ErrorsEnum.Conflict));
        };

        const stringLike = JSON.stringify({
            "message": "Image liked",
            "like_id": postedLike.like_id
        });
        this.getResponse.writeHead(201, {
            "Content-Length": Buffer.byteLength(stringLike),
            "content-type": "application/json"
        })
        .end(stringLike);
    }

    private async postComment(): Promise<void> {
        const csrfTokenFounded = await this.csrfTokenIsValid(CsrfTokenFrom.post);
        if (!csrfTokenFounded) {
            return ;
        };

        if (!this.getBody) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };
            
        const body = JSON.parse(this.getBody) as Readonly<PostCommentBody>;
        if (!body) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const { content, image_id } = body;
        if (!content || !image_id || content.length > 512) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        if (Number.isNaN(image_id)) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const sanitizedContent = sanitizeInput(content);

        const readOnlyAccessToken = this.getReadOnlyAccessToken();
        if (!readOnlyAccessToken) {
            return ;
        };
        const payload = readOnlyAccessToken.getPublicPayload();

        const postedComment = await queryCreateComment(
            this.getClient, [sanitizedContent, payload.user_id.toString(), image_id.toString()]
        );
        if (!postedComment) {
            return (sendError(this.getResponse, ErrorsEnum.Conflict));
        };

        const user = await this.findUserByImageID(image_id);
        if (!user) {
            return (sendError(this.getResponse, ErrorsEnum.Server));
        };

        if (user.mail_preference === true) {
            this.getTransporter.sendMail({
                from: process.env.TRANSPORTER_USER,
                to: user.email,
                subject: "New Comment",
                text: "You have received a new comment!",
                html: "<h3>You have received a new comment!</h3><br><p>Automatically generated message, do not reply.</p>"
            });
        };

        const stringComment = JSON.stringify({
            "message": "comment succesfully uploaded"
        });
        this.getResponse.writeHead(201, {
            "Content-Length": Buffer.byteLength(stringComment),
            "content-type": "application/json"
        })
        .end(stringComment);
    }

    /* DELETE like, image */

    private async deleteLike(id: number): Promise<void> {
        const csrfTokenFounded = await this.csrfTokenIsValid(CsrfTokenFrom.post);
        if (!csrfTokenFounded) {
            return ;
        };

        const readOnlyAccessToken = this.getReadOnlyAccessToken();
        if (!readOnlyAccessToken) {
            return ;
        };

        const payload = readOnlyAccessToken.getPublicPayload();

        const deletedLike = await queryDeleteLike(this.getClient, id, payload.user_id);
        
        if (!deletedLike) {
            return (sendError(this.getResponse, ErrorsEnum.Conflict)); 
        };

        this.getResponse.writeHead(204, "No Content").end();
    }

    private async deleteImage(id: number): Promise<void> {
        const csrfTokenFounded = await this.csrfTokenIsValid(CsrfTokenFrom.settings);
        if (!csrfTokenFounded) {
            return ;
        };

        const readOnlyAccessToken = this.getReadOnlyAccessToken();
        if (!readOnlyAccessToken) {
            return ;
        };

        const payload = readOnlyAccessToken.getPublicPayload();

        const deletedImage = await queryDeleteImage(this.getClient, id, payload.user_id);
        if (!deletedImage) {
            return (sendError(this.getResponse, ErrorsEnum.Conflict)); 
        };

        await unlink(`./uploads/${deletedImage.href}`);

        this.getResponse.writeHead(204, "No Content").end();
    }

    /* PATCH user */

    private async patchUser(id:number) {
        const csrfTokenFounded = await this.csrfTokenIsValid(CsrfTokenFrom.settings);
        if (!csrfTokenFounded) {
            return ;
        };

        if (!this.getBody) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };
            
        const body = JSON.parse(this.getBody) as Readonly<PatchUser>;
        if (!body) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        const { email, username, oldPassword, newPassword, mail_preference } = body;

        if (!oldPassword && newPassword || oldPassword && !newPassword) {
            return (sendError(this.getResponse, ErrorsEnum.BadRquest));
        };

        let credentials: undefined | UserCredentials = undefined;
        if (oldPassword && newPassword) {

            const trimedNewPassword = validPassword(newPassword);
            const trimedOldPassword = validPassword(oldPassword, false);
            if (!trimedOldPassword || !trimedNewPassword) {
                return (sendError(this.getResponse, ErrorsEnum.BadRquest));
            };

            const userCredentials = await queryGetCredentialsByID(this.getClient, id);
            if (!userCredentials) {
                return (sendError(this.getResponse, ErrorsEnum.NotFound));
            };

            if (!comparingPassword(trimedOldPassword, userCredentials.password, userCredentials.salt)) {
                return (sendError(this.getResponse, ErrorsEnum.BadRquest));
            };

            const newCredentials: Readonly<UserCredentials | undefined> = generatePassword(trimedNewPassword);
            if (!newCredentials) {
                return (sendError(this.getResponse, ErrorsEnum.Server));
            };

            credentials = newCredentials;
        };

        const updatedUser = await queryUpdateUser(
            this.getClient,
            id,
            [
                await validAndSanitizeEmail(email),
                validAndSanitizeUsername(username),
                credentials?.password ?? undefined,
                credentials?.salt ?? undefined,
                (mail_preference === true) ? true : (mail_preference === false) ? false : undefined 
            ]
        );
        if (!updatedUser) {
            return (sendError(this.getResponse, ErrorsEnum.Conflict));
        };

        if (credentials && credentials.password === updatedUser.password) {
            
            const fingerprint = this.getFingerprintCookie();
            if (!fingerprint) {
                return (sendError(this.getResponse, ErrorsEnum.Unauthorized));
            };

            const rawAccessToken = this.getRawAccessToken();

            await this.logoutUser(id, rawAccessToken);

            await this.removeCsrfTokenFromDatabase(csrfTokenFounded, CsrfTokenFrom.settings);

            const passwordResponse = JSON.stringify({
                "message": "Password has been changed, please sign in again"
            });
            this.getResponse.writeHead(200, {
                "set-cookie": [ `Secure-Fgp=${fingerprint}; SameSite=Strict; Max-Age=0; Path=/api; HttpOnly; Secure`],
                "Content-Length": Buffer.byteLength(passwordResponse),
                "content-type": "application/json",
                
            })
            .end(passwordResponse);
            return ;
        };

        const user = {
            user_id: updatedUser.user_id,
            email: updatedUser.email,
            username: unsanitizeInput(updatedUser.username),
            verified: updatedUser.verified,
            logged_in: updatedUser.logged_in,
            mail_preference: updatedUser.mail_preference
        } satisfies UserToFront;

        const stringUser = JSON.stringify({
            "message": "User updated sucessfully",
            "user": user
        });
        this.getResponse.writeHead(200, {
            "Content-Length": Buffer.byteLength(stringUser),
            "content-type": "application/json"
        })
        .end(stringUser);
    }

    /* upload sample */

    private async uploadSample(req: IncomingMessage): Promise<void> {
        const csrfTokenFounded = await this.csrfTokenIsValid(CsrfTokenFrom.upload);
        if (!csrfTokenFounded) {
            return ;
        };

        const image = await this.uploadImages(req, UploadDirectory.sample);

        if (typeof image === "number") {
            if (image === -1) {
                return (sendError(this.getResponse, ErrorsEnum.UnsupportedMediaType));
            } else if (image === -2) {
                return (sendError(this.getResponse, ErrorsEnum.PayloadTooLarge));
            } else {
                return (sendError(this.getResponse, ErrorsEnum.Server));
            };
        };

        const stringImage = JSON.stringify({
            "message": "Sample Uploaded",
            "image": image
        });
        this.getResponse.writeHead(201, {
            "Content-Length": Buffer.byteLength(stringImage),
            "content-type": "application/json"
        })
        .end(stringImage);
    }
}

export default Controller;