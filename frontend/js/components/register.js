import {
    createFormGroup,
    createSpanForm,
    createSubmitButton
} from "../components_parts/form_components.js";
import { createDiv, createGenericCardHeader } from "../components_parts/common_components.js";
import { createDivAndAppendNodes } from "../utils/components_utils.js";

/**
 * @returns {HTMLDivElement}
*/
const registerBodyForm = () => {
    const usernameForm = createFormGroup({ 
        type: undefined,
        maxLength: 32,
        required: true,
        id: "input_username",
        labelTitle: "Username",
        attriuteParent: "form-group",
        placeholder: "Enter username",
        extraAttriuteInput: "",
        extraAttriuteLabel: ""
    });

    const usernameSpan = createSpanForm("username_error");
    const emailForm = createFormGroup({
        type: "email",
        maxLength: 255,
        required: true,
        id: "input_email",
        labelTitle: "Email",
        placeholder: "Enter email",
        extraAttriuteInput: "",
        extraAttriuteLabel: "",
        attriuteParent: "form-group mt-2",
    });

    const emailSpan = createSpanForm("email_error");
    const passwordForm = createFormGroup({ 
        type: "password",
        maxLength: 32,
        required: true,
        id: "input_password",
        labelTitle: "Password",
        placeholder: "Enter password",
        extraAttriuteInput: "",
        extraAttriuteLabel: "",
        attriuteParent: "form-group mt-2",
    });

    const helperPassword = createDiv("ms-2 form-text");
    helperPassword.textContent = "Your password must be 8-20 characters long, one uppercase letter, \
        number and special characters."
    const confirmPasswordForm = createFormGroup({
        type: "password",
        maxLength: 32,
        required: true,
        id: "input_confirm_password",
        extraAttriuteInput: "",
        extraAttriuteLabel: "",
        labelTitle: "Confirm password",
        placeholder: "Confirm password",
        attriuteParent: "form-group mt-2",
    });
    const confirmPasswordSpan = createSpanForm("confirmPassword_error");
    
    const submitButton = createSubmitButton();

    const cardBodyDiv = createDivAndAppendNodes("card-body", [usernameForm, usernameSpan, emailForm,
        emailSpan, passwordForm, helperPassword, confirmPasswordForm, confirmPasswordSpan,
        submitButton]);

    return (cardBodyDiv);
};

/**
 * @returns {HTMLDivElement}
*/
const createRegisterForm = () => {
    const parentDiv = createDiv("fill_div container-fluid d-flex align-items-center");
    const wrapperDiv = createDiv("shadow container card border-secondary d-flex justify-content-center");

    const cardHeader = createGenericCardHeader("Register");

    const form = document.createElement("form");
    form.id= "register_form";

    const bodyForm = registerBodyForm();
    form.appendChild(bodyForm);

    wrapperDiv.appendChild(cardHeader);
    wrapperDiv.appendChild(form);
    parentDiv.appendChild(wrapperDiv);

    return (parentDiv);
};

export default createRegisterForm;