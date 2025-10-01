import Form from "./Form.js";
import { PATCH } from "../utils/api.js";
import stateManager from "./StateManager.js";
import managerStatus from "./ManagerStatus.js";
import sessionStorageManagement from "./SessionStorageManagement.js";
import { apiEndpoints, CsrfTokenFrom, endpoints, historyState } from "../utils/utils.js";

/**
 * @typedef {Object} RecoverInputs
 * @property {HTMLInputElement} username
 * @property {HTMLInputElement} code
 * @property {HTMLInputElement} password
 * @property {HTMLInputElement} confirmPassword
*/

/**
 * @typedef {Object} RecoverErrors
 * @property {HTMLInputElement} usernameError
 * @property {HTMLInputElement} codeError
 * @property {HTMLInputElement} confirmPasswordError
*/

export default class Recovery extends Form {
    /** @type {RecoverInputs} */
    #recoverInputs;
    /** @type {RecoverErrors} */
    #errorSpans;

    #listeners = {
        "form": this.#formValidation.bind(this),
        "code": this.#isValidCode.bind(this),
        "username": this.#isValidUsername.bind(this),
        "password": this.#isValidPassword.bind(this),
        "confirmPassword": this.#isValidConfirmPassword.bind(this)
    };

    /**
     * @param {HTMLFormElement} form 
    */
    constructor(form) {
        super(form);
    }

    /*  */

    get #getListeners() {
        return (this.#listeners);
    }

    get #getRecoverInputs() {
        return (this.#recoverInputs);
    }

    get #getErrorsSpans() {
        return (this.#errorSpans);
    }

    /*  */

    /** @param {RecoverInputs} value  */
    set #setRecoverInputs(value) {
        this.#recoverInputs = value;
    }

    /** @param {RecoverErrors} value  */
    set #setErrorsSpans(value) {
        this.#errorSpans = value;
    }

    /*  */

    /** @returns {boolean} */
    init() {

        const codeInput = document.getElementById("code_input");
        const username = document.getElementById("input_username");
        const passwordInput = document.getElementById("input_password");
        const confirmPasswordInput = document.getElementById("input_confirm_password");

        const codeError = document.getElementById("code_error");
        const usernameError = document.getElementById("username_error");
        const confirmPasswordError = document.getElementById("confirmPassword_error");

        if (!codeInput || !username || !passwordInput || !confirmPasswordInput ||
            !codeError || !usernameError|| !confirmPasswordError) {
            return (false);
        };

        this.#setErrorsSpans = {
            codeError: codeError,
            usernameError: usernameError,
            confirmPasswordError: confirmPasswordError
        };
        this.#setRecoverInputs = {
            code: codeInput,
            username: username,
            password: passwordInput,
            confirmPassword: confirmPasswordInput
        };

        this.#getRecoverInputs.code.addEventListener(
            "keyup",
            this.#getListeners["code"],
            false
        );
        this.#getRecoverInputs.username.addEventListener(
            "keyup",
            this.#getListeners["username"],
            false
        );
        this.#getRecoverInputs.password.addEventListener(
            "keyup",
            this.#getListeners["password"],
            false
        );
        this.#getRecoverInputs.confirmPassword.addEventListener(
            "keyup",
            this.#getListeners["confirmPassword"],
            false
        );
        this.getForm.addEventListener("submit", this.#getListeners["form"], false);

        return (true);
    }

    /** @param {SubmitEvent} ev */
    async #formValidation(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        if (
            this.#isValidCode() &&
            this.#isValidUsername() &&
            this.#isValidPassword() &&
            this.#isValidConfirmPassword() 
        ) {
            const { code, username, password } = this.#getRecoverInputs;
            const toSend = {
                code: code.value,
                username: username.value,
                password: password.value
            };

            const response = await PATCH(apiEndpoints.recovery, toSend);
            if (!response.ok) {

                const { message } = response.data;
                if (response.status >= 400 && response.status < 500) {
                    managerStatus.displayToastError(message, response.status, false);
                } else {
                    managerStatus.displayToastError("Error: returning to home", response.status, true);
                };

            } else {
                this.resetInputs();
                this.#removeListeners();

                sessionStorageManagement.removeFromSessionStorage("csrfToken");
                managerStatus.displayToast("Password successfully modified", "text-bg-success", true);
            };
        };
    }

    /**
     * @returns {boolean}
    */
    #isValidPassword() {
        const password = this.#getRecoverInputs.password;
        password.classList.remove("is-invalid");

        if (password.value.trim() === "") {
            password.classList.add("is-invalid");
            return (false);
        }
        const validationRegex = [
            { regex: /.{8,}/ }, // min 8 letters,
            { regex: /[0-9]/ }, // numbers from 0 - 9
            { regex: /[a-z]/ }, // letters from a - z (lowercase)
            { regex: /[A-Z]/ }, // letters from A-Z (uppercase),
            { regex: /[^A-Za-z0-9]/} // special characters
        ];
        for (const item of validationRegex) {
            if (!password.value.match(item.regex)) {
                password.classList.add("is-invalid");
                return (false);
            };
        }
        password.classList.remove("is-invalid");
        return (true);
    }

    /**
     * @returns {boolean}
    */
    #isValidConfirmPassword() {
        const password_error = this.#getErrorsSpans.confirmPasswordError;
        password_error.textContent = "";
        password_error.classList.add("d-none");

        const password = this.#getRecoverInputs.confirmPassword.value.trim();
        if (password === "" || password !== this.#getRecoverInputs.password.value.trim()) {
            password_error.textContent = "The passwords do not match";
            password_error.classList.remove("d-none");
            return (false);
        } else {
            password_error.textContent = "";
            password_error.classList.add("d-none");
            return (true);
        };
    }

    /**
     * @returns {boolean}
    */
    #isValidUsername() {
        const username_error = this.#getErrorsSpans.usernameError;
        username_error.textContent = "";
        username_error.classList.add("d-none");

        const username = document.getElementById("input_username").value;
        if (username.trim() === "") {
            username_error.textContent = "Username field is empty";
            username_error.classList.remove("d-none");
            return (false);
        } else {
            username_error.textContent = "";
            username_error.classList.add("d-none");
            return (true);
        };
    }

    /**
     * @returns {boolean}
    */
    #isValidCode() {
        const code_error = this.#getErrorsSpans.codeError;
        code_error.textContent = "";
        code_error.classList.add("d-none");

        const code = document.getElementById("code_input").value.trim();
        if (code === "" || isNaN(parseInt(code))) {
            code_error.textContent = "Code field is empty or invalid character";
            code_error.classList.remove("d-none");
            return (false);
        } else {
            code_error.textContent = "";
            code_error.classList.add("d-none");
            return (true);
        };
    }

    #removeListeners() {
        this.#getRecoverInputs.code.removeEventListener(
            "keyup",
            this.#getListeners["code"],
            false
        );
        this.#getRecoverInputs.username.removeEventListener(
            "keyup",
            this.#getListeners["username"],
            false
        );
        this.#getRecoverInputs.password.removeEventListener(
            "keyup",
            this.#getListeners["password"],
            false
        );
        this.#getRecoverInputs.confirmPassword.removeEventListener(
            "keyup",
            this.#getListeners["confirmPassword"],
            false
        );
        this.getForm.removeEventListener("submit", this.#getListeners["form"], false);
    }
}