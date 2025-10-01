import { endpoints } from "../utils/utils.js";
import {
    createAnchor,
    createButton
} from "../components_parts/common_components.js";
import stateManager from "../classes/StateManager.js";

const links = Object.freeze([
    {
        path: "/login",
        content: "Login"
    },
    {
        path: "/register",
        content: "Register"
    }
]);

const refreshNavbar = () => {
    const userIsLogged = stateManager.getLogged;

    const linksNode = document.getElementById("links_navbar");
    while (linksNode.lastElementChild) {
        linksNode.removeChild(linksNode.lastElementChild);
    };
    const userNode = document.getElementById("user_navbar");
    while (userNode.lastElementChild) {
        userNode.removeChild(userNode.lastElementChild);
    };

    if (userIsLogged) {
        const button1 = createButton(undefined, "button",
            { styles: "btn btn-success padding_top", content: "New image" });
        button1.addEventListener("click", () => {
            stateManager.loadFragmentPage(endpoints.newImage);
        });

        linksNode.appendChild(button1);

        const button2 = createButton( undefined, "button",
            { styles: "btn btn-info m-0 pe-2 fw-bold d-flex align-items-center", content: "Settings"}
        );
        button2.addEventListener("click", () => {
            stateManager.loadFragmentPage(endpoints.settings);
        });

        const button3 = createButton(undefined, "button",
            { styles: "ms-2 btn btn-danger btn-sm", content: "Logout"});
        button3.addEventListener("click", stateManager.logout.bind(stateManager));

        userNode.appendChild(button2);
        userNode.appendChild(button3);
    } else {
        for (const link of links) {
            const li = document.createElement("li");
            li.setAttribute("class", "nav-item");

            const anchor = createAnchor(undefined, true,
                { styles: "nav-link fw-bold", content: link.content });
            anchor.addEventListener("click", () => {
                stateManager.loadFragmentPage(link.path);
            });
    
            li.appendChild(anchor);
            linksNode.appendChild(li);
        }
    }
}

export default refreshNavbar;