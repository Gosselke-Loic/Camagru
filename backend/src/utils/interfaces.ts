import { PoolClient } from "pg";

import { Roles } from "./enums.js";
import RecoverCache from "../recover/RecoverCache.js";
import TransporterClass from "../transporter/Transporter.js";

interface User {
    user_id: number;
    email: string;
    username: string;
    password: string;
    salt: string;
    updated_at: Date;
    verified: boolean;
    role: Roles;
    logged_in: boolean;
    mail_preference: boolean;
};

interface Image {
    image_id: number;
    href: string;
    original_file_name: string;
    created_at: Date;
    user_id: number;
};

interface Comment {
    comment_id: number;
    content: string;
    created_at: Date | string;
    user_id: number;
    image_id: number;
};

interface Like {
    like_id: number;
    user_id: number;
    image_id: number;
};

interface JwtToken {
    jwt_token_digest: string;
    revocation_date: string;
};

interface ValidationToken {
    validation_token: string;
    user_id: number;
};

interface CsrfTokenDatabase {
    csrf_token: string;
    from_path: string;
    expire_date: number;
    created_at: number;
}

interface UploadFinalImage {
    href: string;
    original_file_name: string;
    sticker: string;
}

/* Others */

interface CoreControllerConstructor {
    client: PoolClient;
    recoverCache: RecoverCache;
    transporter: TransporterClass
};

interface RecoveryCode {
    username: string;
    expireAt: number;
    createdAt: number;
    code: number;
};

interface ProtectedRoute {
    route: string;
    methods: string[];
};

interface CsrfToken {
    from: string;
    token: string;
};

interface ErrorStructure {
    status: number;
    message: string;
};

interface ErrorsConfig {
    [key: string]: ErrorStructure;
};

export {
    User,
    Like,
    Image,
    Comment,
    JwtToken,
    CsrfToken,
    RecoveryCode,
    ErrorsConfig,
    ProtectedRoute,
    ValidationToken,
    UploadFinalImage,
    CsrfTokenDatabase,
    CoreControllerConstructor
}; 