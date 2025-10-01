import Form from "./Form.js";
import stateManager from "./StateManager.js";
import managerStatus from "./ManagerStatus.js";
import { endpoints, historyState } from "../utils/utils.js";

/**
 * @typedef {Object} LoginInputs
 * @property {HTMLInputElement} username
 * @property {HTMLInputElement} password
*/

export default class Login extends Form {
    /** @type {Function} */
    #formListener = this.#formValidation.bind(this);
    /** @type {HTMLParagraphElement} */
    #errorElement;
    /** @type {LoginInputs} */
    #loginInputs;

    /**
     * @param {HTMLFormElement} form 
    */
    constructor(form) {
        super(form);
        this.getForm.addEventListener("submit", this.#getFormListener, false);
    }

    /*  */

    get #getFormListener() {
        return (this.#formListener);
    }

    get #getErrorElement() {
        return (this.#errorElement);
    }

    get #getLoginInputs() {
        return (this.#loginInputs);
    }

    /*  */

    /** @param {HTMLParagraphElement} value  */
    set #setErrorElement(value) {
        this.#errorElement = value;
    }

    /** @param {LoginInputs} value  */
    set #setLoginInputs(value) {
        this.#loginInputs = value;
    }   

    /*  */

    /** @returns {boolean} */
    init() {
        const loginError = document.getElementById("login_error");
        const button = document.getElementById("forgottenButton");
        const username = document.getElementById("input_username");
        const password = document.getElementById("input_password");

        if (!loginError || !button || !username || !password) {
            return (false);
        };
        
        this.#setErrorElement = loginError;
        this.#setLoginInputs = { username: username, password: password };

        button.addEventListener("click", async () => {

            const login_error = this.#getErrorElement;
            login_error.textContent = "";
            login_error.classList.add("d-none");

            /** @type {string} */
            const username = this.#getLoginInputs.username
            .value
            .trim();

            if (!username) {
                login_error.textContent = "Username are empty";
                login_error.classList.remove("d-none");
            } else {
                const toSend = { username: username };

                const responseIsOk = await stateManager.recover(toSend);
                if (responseIsOk) {
                    this.resetInputs();
                    this.getForm.removeEventListener("submit", this.#formListener, false);

                    managerStatus.displayToast("Recovery code successfully sended", "text-bg-info", true);
                };
            };
        });

        return (true);
    }

    /** @param {SubmitEvent} ev */
    async #formValidation(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        const login_error = this.#getErrorElement;
        login_error.textContent = "";
        login_error.classList.add("d-none");

        /** @type {string} */
        const username = this.#getLoginInputs.username
        .value
        .trim();
        
        /** @type {string} */
        const password = this.#getLoginInputs.password
        .value
        .trim();

        if (username === "" || password === "") {
            login_error.textContent = "Username or password are empty";
            login_error.classList.remove("d-none");
        } else {
            const toSend = {
                username: username,
                password: password
            };

            if (await stateManager.login(toSend)) {
                this.resetInputs();
                this.getForm.removeEventListener("submit", this.#formListener, false);

                stateManager.populate();
            };
        }
    }
};