import { createDiv, createButton } from "./common_components.js";

/**
 * @typedef {Object} formGroupOptions
 * @property {string} id
 * @property {boolean} required
 * @property {number} maxLength
 * @property {string} labelTitle
 * @property {string} attriuteParent
 * @property {string} extraAttriuteLabel
 * @property {string} extraAttriuteInput
 * @property {string | undefined} placeholder
 * @property {"email" | "password" | undefined} type
*/

/**
 * @param {string} id
 * @param {formGroupOptions} options
 * @returns {HTMLDivElement}
*/
const createFormGroup = (options) => {
    const parentDiv = createDiv(options.attriuteParent);

    const label = document.createElement("label");
    label.setAttribute("for", options.id);
    label.setAttribute("class", `${options.extraAttriuteLabel} form-label mb-1`);
    label.textContent = options.labelTitle;

    const input = document.createElement("input");
    input.id = options.id;
    if (options.type) {
        if (options.type === "password") {
            input.minLength = 8;
        };
        input.type = options.type;
    };
    if (options.placeholder) {
        input.placeholder = options.placeholder;
    };
    if (options.maxLength && options.maxLength > 0) {
        input.maxLength = options.maxLength;
    };
    input.setAttribute("class", `form-control ${options.extraAttriuteInput}`);
    if (options.required) {
        input.setAttribute("required", "");
    };

    parentDiv.appendChild(label);
    parentDiv.appendChild(input);

    return (parentDiv);
};

/**
 * @param {string} id
 * @param {formGroupOptions} options
 * @returns {HTMLDivElement}
*/
const createNumericFormGroup = (options) => {
    const parentDiv = createDiv(options.attriuteParent);

    const label = document.createElement("label");
    label.setAttribute("for", options.id);
    label.setAttribute("class", `${options.extraAttriuteLabel} form-label mb-1`);
    label.textContent = options.labelTitle;

    const input = document.createElement("input");
    input.id = options.id;
    input.inputMode = "numeric";

    if (options.type) {
        input.type = options.type;
    };
    if (options.placeholder) {
        input.placeholder = options.placeholder;
    };
    if (options.maxLength && options.maxLength > 0) {
        input.maxLength = options.maxLength;
    };
    input.setAttribute("class", `form-control ${options.extraAttriuteInput}`);
    input.setAttribute("required", "");

    parentDiv.appendChild(label);
    parentDiv.appendChild(input);

    return (parentDiv);
};

/**
 * @param {string} id
 * @returns {HTMLSpanElement} 
*/
const createSpanForm = (id) => {
    const span = document.createElement("span");
    span.id = id;
    span.setAttribute("class", "ms-2 d-none text-danger");

    return (span);
};

/**
 * @returns {HTMLDivElement}
*/
const createSubmitButton = () => {
    const parentDiv = createDiv("text-center mt-2");
    const button = createButton(undefined, "submit",
        { styles: "btn btn-primary", content: "Submit" });

    parentDiv.appendChild(button);

    return (parentDiv);
};

export {
    createSpanForm,
    createFormGroup,
    createSubmitButton,
    createNumericFormGroup
};