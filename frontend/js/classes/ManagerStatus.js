import toastManager from "./Toast.js";
import stateManager from "./StateManager.js";
import { endpoints, historyState } from "../utils/utils.js";

class ManagerStatus {
    /** @type {Response} */
    #response;

    constructor () {}

    /**
     * @returns {Response}
    */
    get #getResponse() {
        return (this.#response);
    }
    
    /**
     * @param {Response} value 
    */
    set #setResponse(value) {
        this.#response = value
    }

    /**
     * @param {Response} response 
     * @returns {Object}
    */
    async parseResponse(response) {
        if ( !(response instanceof Response) ) {
            toastManager.makeToast({
                message: `404 : Not found`,
                color: "text-bg-danger"
            });
            stateManager.loadFragmentPage(endpoints.home, historyState.replace);
            return ;
        }
        this.#setResponse = response;
        if (!response.ok) {
            return (await this.#returnResponse());
        };
        return (await this.#returnResponse(true));
    }

    /**
     * @param {number} status
     * @returns {Promise<Object>}
    */
    async #returnResponse(isOk = false) {
        const status = this.#getResponse.status;
        const data = await this.#resolvePayload();
        return ({
            ok: isOk,
            status: status,
            data: data,
        });
    };

    /* Methods */

    /** @returns { Promise<string | any | undefined> } */
    async #resolvePayload() {
        const response = this.#getResponse;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const json = await response.json();
            return (json);
        }

        return (undefined);
    };

    /**
     * @param {string} message
     * @param {number | undefined} status
     * @param {boolean} goHome
    */
    displayToastError(message, status, goHome = false) {
        toastManager.makeToast({
            message: status ? `${status} : ${message}`: message,
            color: "text-bg-danger"
        });

        if (goHome) {
            stateManager.loadFragmentPage(endpoints.home, historyState.replace); 
        };
    }

    /**
     * 
     * @param {string} message 
     * @param {"text-bg-success" | "text-bg-info"} color 
     * @param {boolean} goHome 
     */
    displayToast(message, color, goHome = false) {
        toastManager.makeToast({
            message: message,
            color: color
        });

        if (goHome) {
            stateManager.loadFragmentPage(endpoints.home, historyState.replace);
        };
    }
}

const managerStatus = new ManagerStatus();
Object.freeze(managerStatus);

export default managerStatus;