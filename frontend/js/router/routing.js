import Login from "../classes/Login.js";
import Webcam from "../classes/Webcam.js";
import Register from "../classes/Register.js";
import stateManager from "../classes/StateManager.js";

import createHome from "../components/home.js";
import createLoginForm from "../components/login.js";
import createRegisterForm from "../components/register.js";

import Modal from "../classes/Modal.js";
import Recovery from "../classes/Recovery.js";
import Settings from "../classes/Settings.js";
import { CsrfTokenFrom } from "../utils/utils.js";
import { makeModal } from "../components/modal.js";
import managerStatus from "../classes/ManagerStatus.js";
import createRecoveryForm from "../components/recover.js";

/**
 * @typedef {Object} Route
 * @property {string} name
 * @property {Function} init
*/

/**
 * @typedef { Object.<string, Route> } Routes
*/

/*  */

const initHome = async () => {
    const home = await createHome();
    const content = document.getElementById("content");

    content.appendChild(home);

    if (stateManager.userInMemory()) {

        const modal = makeModal();
        content.appendChild(modal);

        const images = document.querySelectorAll(".home_image");
        for (let i = 0; i < images.length; i++ ) {
            images[i].style = "cursor: pointer;";
            images[i].addEventListener("click", (ev) => {
                ev.preventDefault();
                ev.stopPropagation();

                const bootstrapModal = new bootstrap.Modal("#customModal");
                const modalForm = new Modal(modal, bootstrapModal);

                const initializedModal = modalForm.initModal({ id: images[i].id, path: images[i].src }); 
                if (initializedModal && modalForm.populateModal()) {
                    modalForm.showModal();
                };
            });
        };
    };
};

const initLogin = async () => {
    const token = await stateManager.getCSRFToken(CsrfTokenFrom.login);
    if (!token) {
        return ;
    };

    const loginElement = createLoginForm();
    document.getElementById("content").appendChild(loginElement);

    const form = document.getElementById("login_form");
    const loginForm = new Login(form);
    if (!loginForm.init()) {
        managerStatus.displayToastError("Error to create form, returning to home", undefined, true);
        return ;
    };
};

const initRegister = async () => {
    const token = await stateManager.getCSRFToken(CsrfTokenFrom.register);
    if (!token) {
        return ;
    };

    const registerForm = createRegisterForm();
    document.getElementById("content").appendChild(registerForm);

    const form = document.getElementById("register_form");
    new Register(form);
};

const initWebcamPage = async () => {
    const accessGranted = await stateManager.accessGranted();
    if (!accessGranted || !stateManager.userInMemory()) {
        managerStatus.displayToastError("Unauthorized, please log in", 401, true);
        return ;
    };

    const token = await stateManager.getCSRFToken(CsrfTokenFrom.upload);
    if (!token) {
        return ;
    };

    const webcamForm = new Webcam();
    const webcamPage = await webcamForm.createWebcamPage();
    if (webcamPage === undefined) {
        return ;
    };
    document.getElementById("content").appendChild(webcamPage);

    webcamForm.initWebcamLogic();
};

const initSettingsPage = async () => {
    const user = stateManager.getUser;
    const accessGranted = await stateManager.accessGranted();
    if (!accessGranted || !user) {
        managerStatus.displayToastError("Unauthorized, please log in", 401, true);
        return ;
    };

    const token = await stateManager.getCSRFToken(CsrfTokenFrom.settings);
    if (!token) {
        return ;
    };

    const settings = new Settings();
    const settingsPage = await settings.createSettingsPage(user);
    document.getElementById("content").appendChild(settingsPage);

    if (!settings.init() || !settings.populateYourImages(user.user_id)) {
        managerStatus.displayToastError("Error to create form, returning to home", undefined, true);
        return ;
    };
};

const initRecoveryPage = async () => {
    const token = await stateManager.getCSRFToken(CsrfTokenFrom.recovery);
    if (!token) {
        return ;
    };

    const recoveryFormDiv = createRecoveryForm();
    document.getElementById("content").appendChild(recoveryFormDiv);

    const form = document.getElementById("recovery_form");
    const recovery = new Recovery(form);

    if (!recovery.init()) {
        managerStatus.displayToastError("Error to create form, returning to home", undefined, true);
        return ;
    };
};

/** @type {Routes} */
const hashMapRoutes =  Object.freeze({
    "/": {
        name: "Camgaru",
        init: initHome
    },
    "/login": {
        name: "Login",
        init: initLogin
    },
    "/register": {
        name: "Register",
        init: initRegister
    },
    "/newImage": {
        name: "New image",
        init: initWebcamPage
    },
    "/settings": {
        name: "Settings",
        init: initSettingsPage
    },
    "/recovery": {
        name: "Recovery",
        init: initRecoveryPage
    }
});

export { hashMapRoutes };