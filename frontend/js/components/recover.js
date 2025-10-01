import {
    createSpanForm,
    createFormGroup,
    createSubmitButton,
    createNumericFormGroup
} from "../components_parts/form_components.js";
import { createDivAndAppendNodes } from "../utils/components_utils.js";
import { createDiv, createGenericCardHeader } from "../components_parts/common_components.js";

/**
 * @returns {HTMLDivElement}
*/
const recoverBodyForm = () => {
    const usernameInput = createFormGroup({
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
    const usernameSpan = createSpanForm("username_error");
    const codeInput = createNumericFormGroup({
        type: undefined,
        maxLength: 6,
        id: "code_input",
        labelTitle: "Recover code",
        placeholder: "Enter your code",
        extraAttriuteInput: "",
        extraAttriuteLabel: "",
        attriuteParent: "form-group mt-2",   
    });
    const codeSpan = createSpanForm("code_error");
    const passwordInput = createFormGroup({ 
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
    const confirmPasswordInput = createFormGroup({
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

    const recoverSpan = createSpanForm("recover_error");
    const submitButton = createSubmitButton();

    const cardBodyDiv = createDivAndAppendNodes("card-body",
        [ usernameInput, usernameSpan, codeInput, codeSpan, passwordInput, 
            helperPassword, confirmPasswordInput, confirmPasswordSpan, recoverSpan, submitButton]
    );

    return (cardBodyDiv);
};

/**
 * @returns {HTMLDivElement}
*/
const createRecoveryForm = () => {
    const parentDiv = createDiv("fill_div container-fluid d-flex align-items-center");
    const wrapperDiv = createDiv("shadow container card border-secondary d-flex justify-content-center");

    const cardHeader = createGenericCardHeader("Recovery password");

    const form = document.createElement("form");
    form.id = "recovery_form";

    const bodyForm = recoverBodyForm();
    form.appendChild(bodyForm);

    wrapperDiv.appendChild(cardHeader);
    wrapperDiv.appendChild(form);
    parentDiv.appendChild(wrapperDiv);

    return (parentDiv);
};

export default createRecoveryForm;