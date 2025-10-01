import { 
    createButton,
    createDiv,
    createImage,
    elementGenerator
} from "../components_parts/common_components.js";
import { createDivAndAppendNodes } from "../utils/components_utils.js";

/**
 * @returns {HTMLDivElement}
*/
const makeModal = () => {
    const modal = createDiv("modal fade modal-lg");
    modal.id = "customModal";
    modal.tabIndex = -1;
    modal.ariaHidden = true;

    const dialog = createDiv("modal-dialog");
    const content = createDiv("modal-content");
    const bodyModal = createDiv("modal-body");

    {
        const header = createDiv("modal-header");
        const button = createButton(undefined, "button", { styles: "btn-close", content: undefined });
        button.setAttribute("data-bs-dismiss", "modal");
        button.ariaLabel = "Close";

        header.appendChild(button);
        content.appendChild(header);
    }

    {
        const wrapImage = createDiv("text-center");
        const img = createImage({
            styles: "igm-fluid pb-3",
            id: "imagePost",
            src: undefined,
            alt: undefined
        });

        wrapImage.appendChild(img);
        bodyModal.appendChild(wrapImage);
    }

    {
        const wrapNumberOfLikes = createDiv("pe-1 d-flex align-items-center");
        const h3 = elementGenerator("h3", {
            id: "number_of_likes",
            classAttributes: "m-0",
            content: undefined
        });
        wrapNumberOfLikes.appendChild(h3);

        const button = createButton("buttonLike", "button",
            { content: "Like", styles: "btn btn-success btn-sm p-0 px-1 rounded" }
        );
        button.setAttribute("data-state", "like");

        const wrapLikes = createDivAndAppendNodes("pb-2 ps-3 d-flex border-bottom border-3",
            [wrapNumberOfLikes, button]
        );
        bodyModal.appendChild(wrapLikes);
    }

    {
        const form = document.createElement("form");
        form.setAttribute("class", "p-2 border-bottom border-3 d-flex align-items-center");
        form.id = "comment_form";

        /** @type {HTMLTextAreaElement} */
        const textArea = elementGenerator("textarea",
            { classAttributes: "form-control", content: undefined, id:"textAreaComment" }
        );
        textArea.style = "height: 5rem;";
        textArea.maxLength = 512;
        textArea.setAttribute("placeholder", "Leave a comment here...");

        const label = elementGenerator("label",
            { classAttributes: "form-label", content: "Comment: ", id: undefined }
        );
        label.setAttribute("for", "textAreaComment");

        const error = elementGenerator("p", 
            { classAttributes: "ps-2 text-danger d-none", content: undefined, id: "comment_error"}
        );

        const wrapTextArea = createDivAndAppendNodes("form-floating w-100 pe-2",
            [textArea, label, error]
        );

        const button = createButton(undefined, "submit",
            { content: "Send", styles: "btn btn-success px-3" }
        );

        form.appendChild(wrapTextArea);
        form.appendChild(button);

        bodyModal.appendChild(form);
    }

    {
        const commentsBody = createDiv("pb-2");
        commentsBody.style = "max-height: 30rem; overflow-y: auto;";
        commentsBody.id = "comments";

        bodyModal.appendChild(commentsBody);
    }

    content.appendChild(bodyModal);
    dialog.appendChild(content);
    modal.appendChild(dialog);

    return (modal);
};

export { makeModal };