import {
    createFormGroup,
    createSpanForm,
    createSubmitButton
} from "../components_parts/form_components.js";
import {
    createDiv,
    elementGenerator,
    createGenericCardHeader
} from "../components_parts/common_components.js";
import { createDivAndAppendNodes } from "../utils/components_utils.js";

/**
 * @returns {HTMLDivElement}
*/
const loginBodyForm = () => {
    const usernameForm = createFormGroup({
        type: undefined,
        maxLength: 32,
        required: true,
        id: "input_username",
        labelTitle: "Username",
        placeholder: "Enter username",
        extraAttriuteInput: "",
        extraAttriuteLabel: "",
        attriuteParent: "form-group mt-2",   
    });
    const passwordForm = createFormGroup({  
        type : "password",
        maxLength: 32,
        required: false,
        id: "input_password",
        labelTitle: "Password",
        placeholder: "Enter password",
        extraAttriuteInput: "",
        extraAttriuteLabel: "",
        attriuteParent: "form-group mt-2",   
    });

    const loginSpan = createSpanForm("login_error");
    const submitButton = createSubmitButton();

    const cardBodyDiv = createDivAndAppendNodes("card-body p-0 px-2 pb-2",
        [ usernameForm, loginSpan, passwordForm, submitButton]
    );

    return (cardBodyDiv);
};

/**
 * @returns {HTMLDivElement}
*/
const createLoginForm = () => {
    const parentDiv = createDiv("fill_div container-fluid d-flex align-items-center");
    const wrapperDiv = createDiv("shadow container card border-secondary d-flex justify-content-center");

    const cardHeader = createGenericCardHeader("Login");

    const form = document.createElement("form");
    form.id = "login_form";

    const bodyForm = loginBodyForm();
    form.appendChild(bodyForm);

    const forgottenButtonWrap = createDiv("text-center card-footer bg-transparent");
    const forgottenButton = elementGenerator("button",
        {id: "forgottenButton", content: "Forgotten password", classAttributes: "btn btn-danger me-2"}
    );
    forgottenButtonWrap.appendChild(forgottenButton);

    wrapperDiv.appendChild(cardHeader);
    wrapperDiv.appendChild(form);
    wrapperDiv.appendChild(forgottenButtonWrap)
    parentDiv.appendChild(wrapperDiv);

    return (parentDiv);
};

export default createLoginForm;