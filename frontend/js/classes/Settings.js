import { DELETE, GET } from "../utils/api.js";
import managerStatus from "./ManagerStatus.js";
import { apiEndpoints } from "../utils/utils.js";
import {
    createDiv,
    createButton,
    createGenericCardHeader
} from "../components_parts/common_components.js";
import stateManager from "../classes/StateManager.js";
import { createFormGroup, createSubmitButton } from "../components_parts/form_components.js";

/**
 * @typedef {Object} SettingsInputs
 * @property {HTMLInputElement} email
 * @property {HTMLInputElement} username
 * @property {HTMLInputElement} oldPassword
 * @property {HTMLInputElement} newPassword
*/

export default class Settings {

    /** @type {boolean} */
    #checkBox;

    /** @type {SettingsInputs} */
    #settingsInputs;

    /** @type {HTMLDivElement} */
    #yourImagesDiv;
    
    constructor() {
        this.#checkBox = undefined;
    }

    get #getCheckBox() {
        return (this.#checkBox);
    }

    get #getYourImagesDiv() {
        return (this.#yourImagesDiv);
    }

    get #getSettingsInputs() {
        return (this.#settingsInputs);
    }

    /**
     * @param {boolean} value  
    */
    set #setCheckBox( value ) {
        this.#checkBox = value;
    }

    /**
     * @param {HTMLDivElement} value  
    */
    set #setYourImagesDiv( value ) {
        this.#yourImagesDiv = value;
    }

    /**
     * @param {SettingsInputs} value  
    */
    set #setSettingsInputs( value ) {
        this.#settingsInputs = value;
    }

    /*  */

    /** @returns {boolean} */
    init() {
        const email = document.getElementById("emailSettings");
        const username = document.getElementById("usernameSettings");
        const oldPassword = document.getElementById("oldPasswordSettings");
        const newPassword = document.getElementById("newPasswordSettings");
 
        if (!email || !username || !oldPassword || !newPassword) {
            return (false);
        };

        this.#setSettingsInputs = {
            email: email,
            username: username,
            oldPassword: oldPassword,
            newPassword: newPassword
        };

        return (true);
    }

    /**
     * @param {import("../utils/interface.js").User} user
     * @returns {Promise<HTMLDivElement | undefined>}
    */
    async createSettingsPage(user) {
        const card = createDiv("card");

        {
            const header = createGenericCardHeader("Settings");
            card.appendChild(header);
        }

        const cardBody = createDiv("card-body");
        {
            const emailForm = createFormGroup({
                type: "email",
                required:true,
                maxLength: 255,
                id: "emailSettings",
                labelTitle: "Email",
                attriuteParent: "pb-3",
                placeholder: `${user.email}`,
                extraAttriuteLabel: "",
                extraAttriuteInput: "" 
            }, "email");

            cardBody.appendChild(emailForm);
        }

        {
            const usernameForm = createFormGroup({
                type: "text",
                required:true,
                maxLength: 32,
                id: "usernameSettings",
                labelTitle: "Username",
                attriuteParent: "pb-3",
                extraAttriuteLabel: "",
                extraAttriuteInput: "",
                placeholder: `${user.username}`
            });

            cardBody.appendChild(usernameForm);
        }

        {
            const oldPasswordForm = createFormGroup({
                type: "password",
                maxLength: 32,
                required:true,
                attriuteParent: "pb-3",
                id: "oldPasswordSettings",
                labelTitle: "Old password",
                placeholder: "old password",
                extraAttriuteLabel: "",
                extraAttriuteInput: ""
            });

            cardBody.appendChild(oldPasswordForm);
        }

        {
            const newPasswordForm = createFormGroup({
                type: "password",
                maxLength: 32,
                required:true,
                attriuteParent: "pb-3",
                id: "newPasswordSettings",
                labelTitle: "New password",
                placeholder: "new password",
                extraAttriuteLabel: "",
                extraAttriuteInput: ""
            });

            cardBody.appendChild(newPasswordForm);
        }

        {
            const wrap = createDiv("form-check form-switch ms-3");

            const input = document.createElement("input");
            input.setAttribute("class", "form-check-input");
            input.id = "switchEmailPreference";
            input.type = "checkbox";
            input.role = "switch";

            if (user.mail_preference) {
                input.setAttribute("checked", "");
                this.#setCheckBox = true;
            } else {
                this.#setCheckBox = false;
            };
            input.addEventListener("change", (ev) => {
                ev.preventDefault();

                if (ev.target.checked) {
                    this.#setCheckBox = true;
                } else {
                    this.#setCheckBox = false;
                };
            }, false);

            const label = document.createElement("label");
            label.setAttribute("class", "form-check-label");
            label.setAttribute("for", "switchEmailPreference");
            label.textContent = "Notify new comments by email";

            wrap.appendChild(input);
            wrap.appendChild(label);
            cardBody.appendChild(wrap);
        }

        card.appendChild(cardBody);

        {
            const footer = createDiv("card-footer bg-transparent");

            const button = createSubmitButton();
            button.addEventListener("click", (ev) => {
                ev.preventDefault();
                ev.stopPropagation();

                this.#handleUpdateUser(user.user_id);
            });

            footer.appendChild(button);
            card.appendChild(footer);
        }

        const parent = createDiv("container mt-5");
        parent.appendChild(card);
        
        {
            const wrapImages = createDiv("d-flex justify-content-center");
            const cardImages = createDiv("card mt-5");

            {
                const header = createGenericCardHeader("Your Images");
                cardImages.appendChild(header);
            }

            {
                const yourImagesDiv = createDiv("card-body");
                yourImagesDiv.style.overflowX = "auto";
                yourImagesDiv.style.maxHeight = "35rem";
                yourImagesDiv.id = "yourImagesBody";

                this.#setYourImagesDiv = yourImagesDiv;

                cardImages.appendChild(yourImagesDiv);
            }

            wrapImages.appendChild(cardImages);
            parent.appendChild(wrapImages);
        }

        return (parent);
    }

    /**
     * @param {number} userID 
    */
    async #handleUpdateUser(userID) {
        /** @type {HTMLInputElement} */
        const emailValueTrimed = this.#getSettingsInputs.email;

        /** @type {HTMLInputElement} */
        const usernameValueTrimed = this.#getSettingsInputs.username;

        /** @type {HTMLInputElement} */
        const oldPasswordValueTrimed = this.#getSettingsInputs.oldPassword;

        /** @type {HTMLInputElement} */
        const newPasswordValueTrimed = this.#getSettingsInputs.newPassword;

        const toSend = {
            email: emailValueTrimed.value.trim() ? emailValueTrimed.value.trim() : undefined,
            username: usernameValueTrimed.value.trim() ? usernameValueTrimed.value.trim() : undefined,
            oldPassword: oldPasswordValueTrimed.value.trim() ? oldPasswordValueTrimed.value.trim() : undefined,
            newPassword: newPasswordValueTrimed.value.trim() ? newPasswordValueTrimed.value.trim() : undefined,
            mail_preference: this.#getCheckBox
        };

        const valid = await stateManager.updateUser( toSend, userID );
        if (valid) {
            emailValueTrimed.value = "";
            usernameValueTrimed.value = "";
            oldPasswordValueTrimed.value = "";
            newPasswordValueTrimed.value = "";

            const user = stateManager.getUser;
            emailValueTrimed.placeholder = user.email;
            usernameValueTrimed.placeholder = user.username;
        };
    }

    /** 
     * @param {number} userID
     * @returns {boolean}
    */   
    async populateYourImages(userID) {

        const response = await GET(`${apiEndpoints.image}?user=${userID}`);
        if (!response.ok) {
            const { message } = response.data;
            if (message === "Nothing") {
                return (false);
            };
            managerStatus.displayToastError(message, response.status, true);
            return (false);
        };
        const { images } = response.data;

        const yourImagesDiv = this.#getYourImagesDiv;
        while (yourImagesDiv.lastElementChild) {
            yourImagesDiv.removeChild(yourImagesDiv.lastElementChild);
        };

        if (!images) { return true; };

        for (const image of images) {
            const row = createDiv("row mb-2 border ms-1");

            {
                const imageWrap = createDiv("col-md-8");

                const img = document.createElement("img");
                img.src = `uploads/${image.href}`;
                img.alt = image.original_file_name;
                img.setAttribute("class", "img-fluid rounded-start");

                imageWrap.appendChild(img);
                row.appendChild(imageWrap);
            }
            
            {
                const colButtonWrap = createDiv("col-md-4");
                const buttonWrap = createDiv("card-body h-100 d-flex align-items-center justify-content-center");
                const button = createButton(
                    "removeButton", "button", { content: "Remove", styles: "btn btn-danger btn-lg" }
                );

                button.addEventListener("click", async (ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();

                    const deletedResponse = await DELETE(`${apiEndpoints.image}/${image.image_id}`);
                    if (!deletedResponse.ok) {
                        const { message } = response.data;
                        if (message === "Nothing") {
                            return (false);
                        };

                        managerStatus.displayToastError(response.data.message, response.status, true);
                        return (false);
                    };

                    managerStatus.displayToast("Image successfully deleted", "text-bg-success");

                    return (this.populateYourImages(userID));
                }, false);

                colButtonWrap.appendChild(buttonWrap);
                buttonWrap.appendChild(button);
                row.appendChild(colButtonWrap);
            }

            yourImagesDiv.appendChild(row);
        };

        return (true);
    }
}