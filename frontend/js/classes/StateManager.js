import {
    endpoints,
    apiEndpoints,
    historyState
} from "../utils/utils.js";
import managerStatus from "./ManagerStatus.js";
import { POST, GET, PATCH } from "../utils/api.js";
import refreshNavbar from "../components/navbar.js";
import { hashMapRoutes } from "../router/routing.js";
import { insertMetaContent } from "../utils/csrf_functions.js";
import sessionStorageManagement from "./SessionStorageManagement.js";

/**
 * @typedef { Object } loginResponse
 * @property { string } message
 * @property { string } accessToken
 * @property { import("../utils/interface.js").User } user
*/

/**
 * @typedef { Object } RecoverToSend
 * @property { string } username
*/

class StateManager {
    /** @type { import("../utils/interface.js").User } */
    #user;
    /** @type {boolean} */
    #loaded;
    /** @type {boolean} */
    #logged;

    /** @type {MediaStream} */
    #stream;
    /** @type {string} */
    #lastPath;
    /** @type {number} */
    #homeIndexPage;

    constructor () {
        this.#loaded = false;
        this.#logged = false;
        this.#user = undefined;
        this.#homeIndexPage = 1;
        this.#stream = undefined;
        this.#lastPath = undefined;
    }

    get getUser() {
        return (this.#user);
    }

    get #getStream() {
        return (this.#stream);
    }

    get #getLastPath() {
        return (this.#lastPath);
    }

    get getLoaded() {
        return (this.#loaded);
    }

    get getLogged() {
        return (this.#logged);
    }

    /** @returns {number | undefined} */
    get getUserID() {
        if (!this.#user)
            return (undefined);
        return (this.#user.user_id ? this.#user.user_id : undefined);
    }

    get getHomeIndexPage() {
        return (this.#homeIndexPage);
    }

    /** @param { import("../utils/interface.js").User } value */
    set #setUser(value) {
        this.#user = value;
    }

    /** @param { MediaStream } value */
    set setStream(value) {
        this.#stream = value;
    }

    /** @param { string } value */
    set #setLastPath(value) {
        this.#lastPath = value;
    }

    /** @param { boolean } value */
    set #setLoaded(value) {
        this.#loaded = value;
    }

    /** @param { boolean } value */
    set #setLogged(value) {
        this.#logged = value;
    }

    /** @param { number } value */
    set #setHomeIndexPage(value) {
        this.#homeIndexPage = value;
    }

    /* load components */

    populate() {
        this.#setLoaded = false;
        refreshNavbar();
        this.#setLoaded = true;
    }

    /**
     * @param {string} path 
     * @param {string} toPush 
    */
    async loadFragmentPage(path, toPush = historyState.push) {
        this.#setLoaded = false;
        const currentPage = hashMapRoutes[path];
        if (!currentPage) {
            managerStatus.displayToastError("Page not found, returning to home.", 404, true);
            return ;
        };

        if (path !== endpoints.home && this.getHomeIndexPage !== 1) {
            this.#setHomeIndexPage = 1;
        };

        if (this.#getLastPath === endpoints.newImage) {
            const stream = this.#getStream;
            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());

                const videoTrack = stream.getVideoTracks()[0];
                stream.removeTrack(videoTrack);

                this.setStream = undefined;
            };
        };

        const content = document.getElementById("content");
        while (content.lastElementChild) {
            content.removeChild(content.lastElementChild);
        };

        insertMetaContent("csrf", "");
        document.title = currentPage.name;
        await currentPage.init();

        if (toPush === historyState.push) {
            window.history.pushState("", "", path);
        } else if (toPush === historyState.replace) {
            window.history.replaceState("", "", path);
        };

        this.#setLastPath = path;
        this.#setLoaded = true;
    }

    /* Handling states */

    async selfFromSessionStorage() {
        const user = sessionStorageManagement.getUserFromSessionStorage();

        if (!user) {
            this.#setLogged = false;
            this.#setUser = undefined;
            return ;
        };

        /** @type {import("../utils/interface.js").User} */
        const parsedUser = JSON.parse(user);
        
        /** @type {import("../utils/interface.js").User} */
        this.#setUser = {
            user_id: parsedUser.user_id,
            email: parsedUser.email,
            username: parsedUser.username,
            logged_in: parsedUser.logged_in,
            verified: parsedUser.verified,
            mail_preference: parsedUser.mail_preference
        };

        this.#setLogged = true;
    }

    clearStateAndSessionStorage() {
        this.#setLogged = false;
        this.#setUser = undefined;
        sessionStorageManagement.removeFromSessionStorage("profile");
        sessionStorageManagement.removeFromSessionStorage("accessToken");
    };

    async logout(displayError = true) {
        const response = await POST(apiEndpoints.logout);

        if (!response.ok) {
            const { message } = response.data;
            if (message === "Nothing") {
                return (false);
            };

            if (response.status >= 400 && response.status < 500) {
                managerStatus.displayToastError(message, response.status, false);
            } else {
                managerStatus.displayToastError("Error: returning to home", response.status, true);
            };

            return (false);
        };

        this.clearStateAndSessionStorage();

        this.loadFragmentPage(endpoints.home, historyState.replace);
        this.populate();

        if (displayError) {
            const { message } = response.data;
            managerStatus.displayToast(message, "text-bg-info");
        };
    }

    /**
     * @param {Object} toSend
     * @returns {Promise<boolean>}
    */
    async login( toSend ) {
        const response = await POST( apiEndpoints.login, toSend );

        if (!response.ok) {
            const { message } = response.data;
            if (message === "Nothing") {
                return (false);
            };

            if (response.status >= 400 && response.status < 500) {
                managerStatus.displayToastError(message, response.status, false);
            } else {
                managerStatus.displayToastError("Error: returning to home", response.status, true);
            };

            return (false);
        };

        /** @type {loginResponse} */
        const { accessToken, message, user } = response.data;

        const addAccessToken = sessionStorageManagement.addAccessTokenToStorage( accessToken );
        const addUser = sessionStorageManagement.addProfileToStorage( JSON.stringify(user) );

        if (!addAccessToken || !addUser) {
            managerStatus.displayToastError("Error trying with session storage, please try to login later.", undefined);
            return (false);
        }

        sessionStorageManagement.removeFromSessionStorage("csrfToken");

        await this.selfFromSessionStorage();
        managerStatus.displayToast(message, "text-bg-success", true);

        return (true);
	}

    /**
     * @param {Object} toSend
     * @returns {Promise<boolean>}
    */
    async register( toSend ) {
        const response = await POST(apiEndpoints.register, toSend);
       
        if (!response.ok) {
            const { message } = response.data;
            if (message === "Nothing") {
                return (false);
            };

            if (response.status >= 400 && response.status < 500) {
                managerStatus.displayToastError(message, response.status, false);
            } else {
                managerStatus.displayToastError("Error: returning to home", response.status, true);
            };

            return (false);
        };

        sessionStorageManagement.removeFromSessionStorage("csrfToken");

        return (true);
    }

    /**
     * @param {Object} toSend
     * @param {number} userID 
     * @returns {Promise<boolean>}
    */
    async updateUser( toSend, userID ) {
        const response = await PATCH(`${apiEndpoints.user}/${userID}`, toSend);

        const { message } = response.data;
        if (!response.ok && message) {
            if (message === "Nothing") {
                return (false);
            };

            if (response.status >= 400 && response.status < 500) {
                managerStatus.displayToastError(message, response.status, false);
            } else {
                managerStatus.displayToastError("Error: returning to home", response.status, true);
            };

            return (false);
        };

        if (response.status === 200 && 
            (message && message === "Password has been changed, please sign in again")
        ) {
            this.#setLogged = false;
            this.#setUser = undefined;
            sessionStorageManagement.removeFromSessionStorage("profile");
            sessionStorageManagement.removeFromSessionStorage("accessToken");

            this.populate();
            managerStatus.displayToast(message, "text-bg-info", true);

            return (false)
        };

        const { user } = response.data;
        if (!user) {
            this.logout(false);
            managerStatus.displayToastError("Error trying to update the user.", undefined);
            return (false);
        };

        if (!sessionStorageManagement.addProfileToStorage( JSON.stringify(user) ) ) {
            await this.logout(false);
            managerStatus.displayToastError("Error with session storage, please retry again later.", undefined);
            return (false);
        };

        await this.selfFromSessionStorage();
        managerStatus.displayToast("User updated successfully", "text-bg-success");

        return (true);
    }

    /**
     * @param {RecoverToSend} toSend
     * @returns {Promise<boolean>}
    */
    async recover(toSend) {
        const response = await POST(apiEndpoints.sendRecovery, toSend);

        if (!response.ok) {
            const { message } = response.data;
            if (message === "Nothing") {
                return (false);
            };

            if (response.status >= 400 && response.status < 500) {
                managerStatus.displayToastError(message, response.status, false);
            } else {
                managerStatus.displayToastError("Error: returning to home", response.status, true);
            };

            return (false);
        };

        sessionStorageManagement.removeFromSessionStorage("csrfToken");

        return (true);
    }

    /* CSRF token */

    /**
     * @param {string} from
     * @returns {Promise<boolean>}
    */
    async getCSRFToken(from) {
        const response = await GET( `${apiEndpoints.csrfToken}?from=${from}` );

        if (!response.ok) {
            const { message } = response.data;
            if (message === "Nothing") {
                return (false);
            };

            if (response.status >= 400 && response.status < 500) {
                managerStatus.displayToastError(message, response.status, false);
            } else {
                managerStatus.displayToastError("Error: returning to home", response.status, true);
            };

            return (false);
        };

        insertMetaContent("csrf", response.data.csrfToken);

        return (true);
    }

    /* Utils */

    incrementHomeIndexPage() {
        this.#setHomeIndexPage = this.getHomeIndexPage + 1;
    }

    decrementHomeIndexPage() {
        this.#setHomeIndexPage = this.getHomeIndexPage - 1;
    }

    /** @returns {Promise<boolean>} */
    async accessGranted() {
        const response = await GET(apiEndpoints.access);

        if (response.ok) {
            return (true);
        };

        return (false);
    }

    /** @returns {boolean} */
    userInMemory() {
        const user = this.getUser;
        if (user) {
            return (true);
        };

        return (false);
    };
}

const stateManager = new StateManager();
Object.freeze(stateManager);

export default stateManager;