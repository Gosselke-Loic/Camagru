import stateManager from "../classes/StateManager.js";

const links = Object.freeze([
    {
        path: "#",
        content: "Login"
    },
    {
        path: "#",
        content: "Register"
    }
]);

const refreshNavbar = () => {
    const user = stateManager.getLogged;

    const linksNode = document.getElementById("links_navbar");
    while (linksNode.lastElementChild) {
        linksNode.removeChild(linksNode.lastElementChild);
    };
    const userNode = document.getElementById("user_navbar");
    while (userNode.lastElementChild) {
        userNode.removeChild(userNode.lastElementChild);
    };

    if (user) {
        const button1 = document.createElement("button");
        button1.textContent = "New image";
        button1.setAttribute("class", "btn btn-success");
        button1.addEventListener("click", () => {
            stateManager.loadFragmentPage("/upload"); // make object with paths
        });

        linksNode.appendChild(button1);

        const userInfo = stateManager.getUser;

        const anchor = document.createElement("a");
        anchor.role = "button";
        anchor.setAttribute("class", "m-0 pe-2 fw-bold d-flex align-items-center border-end border-2 border-dark");
        anchor.textContent = userInfo?.username ? userInfo.username : "guest";
        anchor.addEventListener("click", () => {
            stateManager.loadFragmentPage("/settings"); // make object with paths
        });

        const button2 = document.createElement("button");
        button2.setAttribute("class", "ms-2 btn btn-danger btn-sm");
        button2.type = "button";
        button2.textContent = "Logout";
        button2.addEventListener("click", stateManager.logout.bind(stateManager));

        userNode.appendChild(anchor);
        userNode.appendChild(button2);
    } else {
        for (const link of links) {
            const li = document.createElement("li");
            li.setAttribute("class", "nav-item");
    
            const anchor = document.createElement("a");
            anchor.setAttribute("class", "nav-link fw-bold");
            anchor.role = "button";
            anchor.textContent = link.content;
    
            anchor.addEventListener("click", () => {
                stateManager.loadFragmentPage(link.path);
            });
    
            li.appendChild(anchor);
            linksNode.appendChild(li);
        }
    }
}

export default refreshNavbar;