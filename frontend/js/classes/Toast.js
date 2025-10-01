import { createDiv } from "../components_parts/common_components.js";

/**
 * @typedef { Object } options
 * @property { string } color
 * @property { string } message
*/

class ToastManager {
    #parentNode = undefined;

    constructor() {};

    /**
     * @returns {HTMLDivElement}
    */
    get #getParentnode() {
        return (this.#parentNode);
    };

    /**
     * @param {HTMLDivElement} value
    */
    set #setParentNode( value ) {
        this.#parentNode = value;
    };

    init() {
        const wrapper = createDiv("position-relative");
        wrapper.setAttribute("aria-live", "polite");
        wrapper.setAttribute("aria-atomic", "true");

        const toastContainer = createDiv("toast-container bottom-0 end-0 p-3");
        wrapper.appendChild( toastContainer );

        const footer = document.getElementById("toast");
        if (footer) {
            footer.appendChild( wrapper );
        } else {
            const newFooter = document.createElement("footer");
            newFooter.id = "toast";
            footer.appendChild( wrapper );
            document.body.appendChild( footer );
        }

        this.#setParentNode = toastContainer;
    }

    /**
     * @param {options} options 
     * @returns {HTMLDivElement}
    */
    #createToast( options ) {
        const toast = document.createElement("div");
        toast.role = "alert";
        toast.ariaAtomic = "true";
        toast.ariaLive = "assertive";
        toast.setAttribute("class", `toast align-items-center border-0 mb-1 ${options.color}`);

        const wrapperDiv = document.createElement("div");
	    wrapperDiv.setAttribute("class", "d-flex");
        
        const toastBody = document.createElement("div");
        toastBody.style = "text-align: justify;";
        toastBody.setAttribute("class", "toast-body text-break m-0");
        toastBody.textContent = options.message;

        wrapperDiv.appendChild(toastBody);

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.ariaLabel = "Close";
        closeButton.setAttribute("data-bs-dismiss", "toast");
        closeButton.setAttribute("class", "btn-close me-2 m-auto");
        wrapperDiv.appendChild(closeButton);

        toast.appendChild( wrapperDiv );

        return (toast);
    }

    /**
     * @param {options} options
    */
    makeToast ( options ) {
        const toast = this.#createToast( options );

        this.#getParentnode.appendChild( toast );
        const handler = new bootstrap.Toast( toast );
        handler.show();

        toast.addEventListener("hidden.bs.toast", (e) => {
            e.preventDefault();
            this.#getParentnode.removeChild(toast);
        });
    }
}

const toastManager = new ToastManager();
Object.freeze(toastManager);

export default toastManager;