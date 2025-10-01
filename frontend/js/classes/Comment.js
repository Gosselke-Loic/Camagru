import Form from "./Form.js";
import { POST } from "../utils/api.js";
import managerStatus from "./ManagerStatus.js";
import { apiEndpoints } from "../utils/utils.js";

export default class CommentForm extends Form {
    #imageID = undefined;
    #formListener = this.#formValidation.bind(this);

    /**
     * @param {HTMLFormElement} form 
    */
    constructor(form, id) {
        super(form);
        this.#setImageID = id;
        this.getForm.addEventListener("submit", this.#getFormListener, false);
    }

    /*  */

    /**
     * @returns {Object}
    */
    get #getFormListener() {
        return (this.#formListener);
    }

    /**
     * @returns {number}
    */
    get #getImageID() {
        return (this.#imageID);
    }

    /*  */

    /**
     * @param {number} id  
    */
    set #setImageID(id) {
        this.#imageID = id;
    }

    /*  */

    /**
     * @param {SubmitEvent} ev
    */
    async #formValidation(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        const comment_error = document.getElementById("comment_error");
        comment_error.textContent = "";
        comment_error.classList.add("d-none");

        const comment = document.getElementById("textAreaComment")
        .value
        .trim();

        if (comment === "") {
            comment_error.textContent = "Comment textarea are empty";
            comment_error.classList.remove("d-none");
        } else {
            const toSend = {
                comment: comment,
                image_id: this.#getImageID   
            };
            const response = await POST(apiEndpoints.comment, toSend);

            if (!response.ok) {
                managerStatus.displayToastError("Error: trying to process this comment right now, \
                    please try again later.");
            } else {
                this.resetInputs();
                this.getForm.removeEventListener("submit", this.#formListener, false);
            };
        }
    }
};