import Form from "./Form.js";
import stateManager from "./StateManager.js";
import managerStatus from "./ManagerStatus.js";
import { endpoints, historyState } from "../utils/utils.js";

export default class Register extends Form {
    #email = "";
    #password = "";
    #username = "";
    #confirmPassword = "";

    #inputsIds = ["input_username", "input_email", "input_password",
        "input_confirm_password"];
    #listeners = {
        "form": this.#formValidation.bind(this),
        "input_username": this.#isValidUsername.bind(this),
        "input_email": this.#isValidEmail.bind(this),
        "input_password": this.#isValidPassword.bind(this),
        "input_confirm_password": this.#isValidConfirmPassword.bind(this)
    };

    /**
     * @param {HTMLFormElement} form 
    */
    constructor(form) {
        super(form);

        this.getForm.addEventListener("submit", this.#getListeners["form"], false);
        this.#inputsIds.forEach((id) => {
            document.getElementById(id).addEventListener("keyup", this.#getListeners[id], false);
        });
    }

    /*  */

    /**
     * @returns {string}
    */
    get #getEmail() {
        return (this.#email);
    }

    /**
     * @returns {string}
    */
    get #getUsername() {
        return (this.#username);
    }

    /**
     * @returns {Array<string>}
    */
    get #getInputsIds() {
        return (this.#inputsIds);
    }

    /**
     * @returns {Object}
    */
    get #getListeners() {
        return (this.#listeners);
    }

    /**
     * @returns {string}
    */
    get #getPassword() {
        return (this.#password);
    }

    /**
     * @returns {string}
    */
    get #getConfirmPassword() {
        return (this.#confirmPassword);
    }

    /*  */

    /**
     * @param {string} email
    */
    set #setEmail(email) {
        this.#email = email;
    }

    /**
     * @param {string} password
    */
    set #setPassword(password) {
        this.#password = password;
    }

    /**
     * @param {string} username
    */
    set #setUsername(username) {
        this.#username = username;
    }

    /**
     * @param {string} password
    */
    set #setConfirmPassword(password) {
        this.#confirmPassword = password;
    }

    /*  */

    /**
     * @param {SubmitEvent} ev
    */
    async #formValidation(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        if (this.#isValidForm()) {
            const toSend = {
                email: this.#getEmail,
                username: this.#getUsername,
                password: this.#getPassword
            };
            const response = await stateManager.register(toSend);

            if (response) {
                this.resetInputs();
                this.#removeListeners();

                managerStatus.displayToast(
                    "Successfully registered, validation mail was sended", "text-bg-success", true
                );
            };
        }
    } 

    /**
     * @returns {boolean}
    */
    #isValidForm() {
        if (
            this.#getEmail !== "" &&
            this.#getUsername !== "" &&
            this.#getPassword !== "" &&
            this.#getConfirmPassword !== ""
        ) {
            if (!this.#isValidEmail())
                return (false);
            if (!this.#isValidPassword())
                return (false);
            if (!this.#isValidConfirmPassword())
                return (false);
            return (true);
        }
        return (false);
    }

    /**
     * @returns {boolean}
    */
    #isValidEmail() {
        const email_error = document.getElementById("email_error");
        email_error.textContent = "";
        email_error.classList.add("d-none");

        const email = document.getElementById("input_email").value;
        const regEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (email.trim() === "") {
            email_error.textContent = "Email field is empty";
            email_error.classList.remove("d-none");
        }
        else if (!email.toLowerCase().match(regEmail)) {
            email_error.textContent = "Email format error";
            email_error.classList.remove("d-none");
        }
        else {
            this.#setEmail = email;
            email_error.textContent = "";
            email_error.classList.add("d-none");
            return (true);
        }
        return (false);
    }

    /**
     * @returns {boolean}
    */
    #isValidUsername() {
        const username_error = document.getElementById("username_error");
        username_error.textContent = "";
        username_error.classList.add("d-none");

        const username = document.getElementById("input_username").value;
        if (username.trim() === "") {
            username_error.textContent = "Username field is empty";
            username_error.classList.remove("d-none");
        }
        else {
            this.#setUsername = username;
            username_error.textContent = "";
            username_error.classList.add("d-none");
        }
    }

    /**
     * @returns {boolean}
    */
    #isValidPassword() {
        const password = document.getElementById("input_password");
        password.classList.remove("is-invalid");

        if (password.value.trim() === "") {
            password.classList.add("is-invalid");
            return (false);
        };
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
            }
        };
        this.#setPassword = password.value;
        password.classList.remove("is-invalid");
        return (true);
    }

    /**
     * @returns {boolean}
    */
    #isValidConfirmPassword() {
        const password_error = document.getElementById("confirmPassword_error");
        password_error.textContent = "";
        password_error.classList.add("d-none");

        const password = document.getElementById("input_confirm_password").value;
        if (password !== this.#getPassword) {
            password_error.textContent = "The passwords do not match";
            password_error.classList.remove("d-none");
        }
        else {
            this.#setConfirmPassword = password;
            password_error.textContent = "";
            password_error.classList.add("d-none");
            return (true);
        }
        return (false);
    }

    #removeListeners() {
        this.getForm.removeEventListener("submit", this.#getListeners["form"], false);
        this.#getInputsIds.forEach((id) => {
            document.getElementById(id).removeEventListener("keyup", this.#getListeners[id], false);
        });
    }
};
