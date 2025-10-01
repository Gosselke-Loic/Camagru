import { endpoints } from "../utils/utils.js";
import stateManager from "../classes/StateManager.js";

/**
 * @param {number} totalImages
 * @param {number} currentPage
 * @returns {HTMLElement}
*/
const createPagination = (totalImages, currentPage) => {
    const navElement = document.createElement("nav");
    navElement.setAttribute("class", "d-flex justify-content-center pt-2");
    navElement.ariaLabel = "Page navigation";

    const ulELement = document.createElement("ul");
    ulELement.setAttribute("class", "pagination");

    const numberOfPages = Math.ceil(totalImages/5);
    
    {
        const prevElement = document.createElement("li");
        prevElement.setAttribute("class", "page-item");

        const anchorElement = document.createElement("a");
        anchorElement.setAttribute("class", "page-link");
        anchorElement.role = "button";
        anchorElement.textContent = "Prev";
        if (currentPage === 1) {
            anchorElement.classList.add("disabled");
        } else {
            anchorElement.addEventListener("click", () => {
                stateManager.decrementHomeIndexPage();
                stateManager.loadFragmentPage(endpoints.home);
            });
        }

        prevElement.appendChild(anchorElement);
        ulELement.appendChild(prevElement);
    }
    {
        const prevElement = document.createElement("li");
        prevElement.setAttribute("class", "page-item");

        const anchorElement = document.createElement("a");
        anchorElement.setAttribute("class", "page-link");
        anchorElement.textContent = currentPage.toString();

        prevElement.appendChild(anchorElement);
        ulELement.appendChild(prevElement);
    }
    {
        const prevElement = document.createElement("li");
        prevElement.setAttribute("class", "page-item");

        const anchorElement = document.createElement("a");
        anchorElement.setAttribute("class", "page-link");
        anchorElement.role = "button";
        anchorElement.textContent = "Next";
        if (currentPage === numberOfPages) {
            anchorElement.classList.add("disabled");
        } else {
            anchorElement.addEventListener("click", () => {
                stateManager.incrementHomeIndexPage();
                stateManager.loadFragmentPage(endpoints.home);
            });
        }

        prevElement.appendChild(anchorElement);
        ulELement.appendChild(prevElement);
    }

    navElement.appendChild(ulELement);
    return (navElement);
};

export default createPagination;