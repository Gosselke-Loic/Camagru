import stateManager from "./StateManager.js";
import managerStatus from "./ManagerStatus.js";
import { DELETE, GET, POST } from "../utils/api.js";
import { insertMetaContent } from "../utils/csrf_functions.js";
import { apiEndpoints, CsrfTokenFrom } from "../utils/utils.js";
import { createDivAndAppendNodes } from "../utils/components_utils.js";
import { elementGenerator } from "../components_parts/common_components.js";

/**
 * @typedef {Object} ImageInfo
 * @property {string} path
 * @property {number} id
*/

/**
 * @typedef {Object} Comment
 * @property {number} comment_id
 * @property {string} content
 * @property {string} created_at
 * @property {string} username
*/

/**
 * @typedef {Object} Like
 * @property {string} like_id
 * @property {number} user_id
*/

/**
 * @typedef {Object} LikeData
 * @property {number} total
 * @property {Like[]} likes
*/

/**
 * @typedef {Object} CommentData
 * @property {number} total
 * @property {Comment[]} comments  
*/

/**
 * @typedef {Object} BootstrapModal
 * @property {Function} hide
 * @property {Function} show
 * @property {Function} dispose
*/

/**
 * @typedef {Object} CommentElements
 * @property {HTMLDivElement} commentsBody
 * @property {HTMLTextAreaElement} commentInput
 * @property {HTMLParagraphElement} commentError
*/

export default class Modal {
    /** @type {HTMLDivElement} */
    #modalElement;
    /** @type {Function} */
    #showModalListener = this.#showModalListenerFunction.bind(this);
    /** @type {Function} */
    #hiddenModalListener = this.#hiddenModalListenerFunction.bind(this);

    /** @type {Object} */
    #modalBootstrap;

    /** @type {ImageInfo} */
    #imageInfo;
    /** @type {HTMLElement} */
    #likeCounter;

    /** @type {HTMLButtonElement} */
    #buttonElement;
    /** @type {Function} */
    #likeListener = this.#buttonElementListenerFunction.bind(this);

    /** @type {HTMLFormElement} */
    #commentForm;
    /** @type {CommentElements} */
    #commentElements;
    /** @type {Function} */
    #commentListener = this.#CommentListenerFunction.bind(this);

    /**
     * @param {BootstrapModal} modalBootstrap
     * @param {HTMLDivElement} modalElement
    */
    constructor(modalElement, modalBootstrap) {
        this.#setModalElement = modalElement;
        this.#setModalBootstrap = modalBootstrap;
    }

    /*  */

    get #getImageInfo() {
        return (this.#imageInfo);
    }

    get #getLikeCounter() {
        return (this.#likeCounter);
    }

    get #getCommentForm() {
        return (this.#commentForm);
    }

    get #getModalElement() {
        return (this.#modalElement);
    }

    get #getLikeListener() {
        return (this.#likeListener);
    }

    get #getButtonElement() {
        return (this.#buttonElement);
    }

    get #getModalBootstrap() {
        return (this.#modalBootstrap);
    }

    get #getCommentElements() {
        return (this.#commentElements);
    }

    get #getCommentListener() {
        return (this.#commentListener);
    }

    get #getShowModalListener() {
        return (this.#showModalListener);
    }

    get #getHiddenModalListener() {
        return (this.#hiddenModalListener);
    }

    /*  */

    /**
     * @param {HTMLDivElement} modal
    */
    set #setModalElement(modal) {
        this.#modalElement = modal;
    }

    /**
     * @param {ImageInfo} imageInfo
    */
    set #setImageInfo(imageInfo) {
        this.#imageInfo = imageInfo;
    }

    /**
     * @param {HTMLFormElement} form
    */
    set #setCommentForm(form) {
        this.#commentForm = form;
    }

    /**
     * @param {BootstrapModal} modal
    */
    set #setModalBootstrap(modal) {
        this.#modalBootstrap = modal;
    }

    /**
     * @param {HTMLButtonElement} button
    */
    set #setButtonElement(button) {
        this.#buttonElement = button;
    }

    /**
     * @param {CommentElements} commentElements
    */
    set #setCommentElements(commentElements) {
        this.#commentElements = commentElements;
    }

    /**
     * @param {HTMLElement} likeCounter
    */
    set #setLikeCounterElement(likeCounter) {
        this.#likeCounter = likeCounter;
    }

    /*  */

    showModal() {
        this.#getModalBootstrap.show();
    }

    hideModal() {
        this.#getModalBootstrap.hide();;
        this.#getModalBootstrap.dispose();
    };

    async #showModalListenerFunction() {
        const token = await stateManager.getCSRFToken(CsrfTokenFrom.post);
        if (!token) {
            return ;
        };
        this.#getModalElement.ariaHidden = false;
    }

    async #hiddenModalListenerFunction() {
        this.#removeEventListeners();
        this.#getModalElement.ariaHidden = true;
        insertMetaContent("csrf", "");
    }

    /**
     * @param {ImageInfo} imageInfo
     * @returns {boolean}
    */
    initModal(imageInfo) {
        const modalBootstrap = this.#getModalBootstrap;

        const commentsBody = document.getElementById("comments");
        const comment = document.getElementById("textAreaComment")
        const buttonElement = document.getElementById("buttonLike");
        const commentForm = document.getElementById("comment_form");
        const commentError = document.getElementById("comment_error");
        const likeCounterElement = document.getElementById("number_of_likes");

        if (!buttonElement || !commentForm || !likeCounterElement ||
            !commentsBody || !commentError || !comment
        ) {
            managerStatus.displayToastError("Error to load the modal", undefined, false);
            modalBootstrap.hide();
            return (false);
        };

        this.#setImageInfo = imageInfo;
        this.#setCommentForm = commentForm;
        this.#setButtonElement = buttonElement;
        this.#setLikeCounterElement = likeCounterElement;
        this.#setCommentElements = { commentsBody: commentsBody, commentError: commentError, commentInput: comment };

        const modalElement = this.#getModalElement;
        
        modalElement.addEventListener("show.bs.modal", this.#getShowModalListener, false);
        modalElement.addEventListener("hidden.bs.modal", this.#getHiddenModalListener, false);

        return (true);
    }

    /**
     * @param {number} id
     * @return {boolean}
    */
    async #populateComments (id) {

        const commentsBody = this.#getCommentElements.commentsBody;
        while (commentsBody.lastElementChild) {
            commentsBody.removeChild(commentsBody.lastElementChild);
        };

        /** @type {import("../utils/interface.js").ParsedResponse} */
        const response = await GET(`${apiEndpoints.comment}?image=${id}`);
        if (!response.ok) {
            const h3 = document.createElement("h3");
            h3.setAttribute("class", "text-center text-danger");
            h3.textContent = "Error to load comments, try again later";
            commentsBody.appendChild(h3);
            return (true);
        };

        /** @type {CommentData} */
        const { comments } = response.data;

        if (comments.length === 0) {
            const h3 = document.createElement("h3");
            h3.setAttribute("class", "text-center");
            h3.textContent = "No comments";
            commentsBody.appendChild(h3);
            return (true);
        };

        for (const [index, comment] of comments.entries()) {
            
            const h5 = elementGenerator("h5", {
                classAttributes: "card-title",
                id: undefined,
                content: `${comment.username}'s comment:`
            });

            const h6 = elementGenerator("h6", {
                classAttributes: "card-subtitle pb-2 ps-1 text-body-secondary",
                id: undefined,
                content: `at ${comment.created_at}`
            });

            const p = elementGenerator("p", {
                classAttributes: "card-text",
                id: undefined,
                content: comment.content
            });

            const cardBody = createDivAndAppendNodes("card bg-transparent m-2 text-center",
                [h5, h6, p]
            );
            cardBody.setAttribute("data-index", `${index}`);

            commentsBody.appendChild(cardBody);
        };

        return (true);
    }

    /** @returns {boolean} */
    async populateModal() {
        const imageInfo = this.#getImageInfo;
        const modalBootstrap = this.#getModalBootstrap;

        {
            /** @type {HTMLImageElement} */
            const image = document.getElementById("imagePost");
            if (!image) {
                managerStatus.displayToastError("Error to load the modal", undefined, false);
                modalBootstrap.hide();
                return (false);
            };

            image.src = imageInfo.path;
            image.alt = 'Image from home';
        }

        {
            const currentUserID = stateManager.getUserID;
            if (!currentUserID) {
                managerStatus.displayToastError("Error to load the modal", undefined, false);
                modalBootstrap.hide();
                return (false);
            };

            const response = await GET(`${apiEndpoints.like}?image=${imageInfo.id}&user=${currentUserID}`);
            if (!response.ok) {
                managerStatus.displayToastError("Error to load the modal", undefined, false);
                modalBootstrap.hide();
                return (false);
            };

            /** @type {LikeData} */
            const { likes, total } = response.data;

            const number_of_likes = this.#likeCounter;
            number_of_likes.textContent = `${total > 0 ? total : 0}`;

            const buttonLike = this.#getButtonElement;
            if (likes[0]) {
                buttonLike.textContent = "Unlike";
                buttonLike.classList.remove("btn-success");
                buttonLike.classList.add("btn-danger");
                buttonLike.setAttribute("data-state", "unlike");
                buttonLike.setAttribute("data-deleteid", `${likes[0].like_id}`);
            } else {
                buttonLike.setAttribute("data-state", "like");
                buttonLike.classList.remove("btn-danger");
                buttonLike.classList.add("btn-success");
                buttonLike.textContent = "Like";
            };

            buttonLike.addEventListener("click", this.#getLikeListener, false);
        }

        {
            if (!this.#populateComments(imageInfo.id)) {
                return (false);
            };

            this.#getCommentForm.addEventListener("submit", this.#getCommentListener, false);
        }
    };

    async #CommentListenerFunction(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        const { commentError, commentInput } = this.#getCommentElements;

        commentError.textContent = "";
        commentError.classList.add("d-none");

        const commentInputValue = commentInput.value.trim();

        if (commentInputValue === "") {
            commentError.textContent = "Comment textarea are empty";
            commentError.classList.remove("d-none");
        } else {
            const toSend = {
                content: commentInputValue,
                image_id: this.#getImageInfo.id
            };

            const response = await POST(apiEndpoints.comment, toSend);
            if (!response.ok) {
                commentError.textContent = "Fail to upload the comment, try again later";
                commentError.classList.remove("d-none");
            } else {
                this.#getCommentForm.reset();
                this.#populateComments(this.#getImageInfo.id);
            };
        };
    }

    async #buttonElementListenerFunction(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        const buttonLike = this.#getButtonElement;

        const state = buttonLike.dataset.state;
        if (state && state === "like") {

            const response = await POST(apiEndpoints.like, { image_id: this.#getImageInfo.id });
            if (!response.ok) {
                managerStatus.displayToastError("Error to load the modal", undefined);
                this.#getModalBootstrap.hide();
                return ;
            };

            const { like_id } = response.data;

            buttonLike.setAttribute("data-deleteid", `${like_id}`);
            buttonLike.setAttribute("data-state", "unlike");
            buttonLike.classList.remove("btn-success");
            buttonLike.classList.add("btn-danger");
            buttonLike.textContent = "Unlike";

        } else {

            const id = buttonLike.dataset.deleteid;
            const response = await DELETE(`${apiEndpoints.like}/${id}`);
            if (!response.ok) {
                managerStatus.displayToastError("Error to load the modal", false);
                this.#getModalBootstrap.hide();
                return ;
            };

            buttonLike.setAttribute("data-state", "like");
            buttonLike.classList.remove("btn-danger");
            buttonLike.classList.add("btn-success");
            buttonLike.textContent = "Like";

        };

        const response = await GET(`${apiEndpoints.like}?image=${this.#getImageInfo.id}`);
        if (!response.ok) {
            managerStatus.displayToastError("Error to load the number of likes, retry again", undefined);
        };

        /** @type {LikeData} */
        const { total } = response.data;

        const totalLikes = total > 0 ? total : 0;
        this.#getLikeCounter.textContent = `${totalLikes}`;
    }

    #removeEventListeners() {
        this.#getButtonElement.removeEventListener("click", this.#getLikeListener, false);
        this.#getCommentForm.removeEventListener("submit", this.#getCommentListener, false);

        this.#getModalElement.removeEventListener("show.bs.modal", this.#getShowModalListener, false);
        this.#getModalElement.removeEventListener("hidden.bs.modal", this.#getHiddenModalListener, false);
    }
};
