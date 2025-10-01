import toastManager from "./classes/Toast.js";
import stateManager from "./classes/StateManager.js";
import { endpoints, historyState } from "./utils/utils.js";

// test responsive
// test all cases
document.addEventListener("DOMContentLoaded", async () => {

    stateManager.selfFromSessionStorage();
    toastManager.init();
    stateManager.populate();

    {
        const home = document.getElementById("go_home");
        home.role = "button";
        home.addEventListener("mouseenter", () => { home.style.color = "#da3664" });
        home.addEventListener("mouseleave", () => { home.style.color = "black" });
        home.addEventListener("click", () => { stateManager.loadFragmentPage(endpoints.home) });
    }

    if (stateManager.getLoaded) {
        const path = window.location.pathname;
        stateManager.loadFragmentPage(path);
    };
});

window.addEventListener("popstate", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    const path = window.location.pathname;
    if (path === "/") {
        window.history.replaceState("", "", "/");
        stateManager.loadFragmentPage("/", historyState.nopush);
    } else {
        stateManager.loadFragmentPage(path, historyState.nopush);
    }
});