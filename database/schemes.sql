CREATE TYPE role_enum AS ENUM ('admin', 'user');

CREATE TABLE c_user (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(32) UNIQUE NOT NULL,
    password CHAR(128) NOT NULL,
    salt CHAR(128) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    role role_enum NOT NULL DEFAULT 'user',
    logged_in BOOLEAN NOT NULL DEFAULT false,
    mail_preference BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE c_image (
    image_id SERIAL PRIMARY KEY,
    href VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES c_user(user_id) ON DELETE CASCADE
);

CREATE TABLE c_comment (
    comment_id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL,
    image_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES c_user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (image_id) REFERENCES c_image(image_id) ON DELETE CASCADE
);

CREATE TABLE c_like (
    like_id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL,
    image_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES c_user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (image_id) REFERENCES c_image(image_id) ON DELETE CASCADE
);

CREATE TABLE revoked_token (
    jwt_token_digest TEXT PRIMARY KEY,
    revocation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE csrf_token (
    csrf_token VARCHAR(32) PRIMARY KEY,
    from_path VARCHAR(32) NOT NULL,
    expire_date INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE TABLE validation_token (
    validation_token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES c_user(user_id) ON DELETE CASCADE
);