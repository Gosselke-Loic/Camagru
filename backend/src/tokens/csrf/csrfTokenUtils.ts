import { CsrfTokenFrom } from "../../utils/enums.js";
import { CsrfTokenDatabase } from "../../utils/interfaces.js";

function CsrfTokenIsExpired(
    csrfToken: CsrfTokenDatabase,
): Readonly<boolean> {
    const now = ~~(new Date().getTime() / 1000);
    if ( now < csrfToken.created_at || now > csrfToken.expire_date ) {
        return (true);
    };

    return (false);
};

function switchCaseCsrfTokenFrom(from:string): CsrfTokenFrom | "" {
    switch (from) {
        case CsrfTokenFrom.register:
            return (CsrfTokenFrom.register);
        case CsrfTokenFrom.login:
            return (CsrfTokenFrom.login);
        case CsrfTokenFrom.post:
            return (CsrfTokenFrom.post);
        case CsrfTokenFrom.settings:
            return (CsrfTokenFrom.settings);
        case CsrfTokenFrom.upload:
            return (CsrfTokenFrom.upload);
        case CsrfTokenFrom.recovery:
            return (CsrfTokenFrom.recovery);
        default:
            return ("");
    };
};

export {
    CsrfTokenIsExpired,
    switchCaseCsrfTokenFrom
};