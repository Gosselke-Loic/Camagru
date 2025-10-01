import { createDiv } from "../components_parts/common_components.js";

/**
 * @param {string} parentStyles
 * @param {Array<HTMLElement>} nodes
 * @returns {HTMLDivElement} Contains all nodes from array parameter
*/
const createDivAndAppendNodes = (parentStyles, nodes) => {
    const parentDiv = createDiv(parentStyles);

    nodes.forEach((node) => parentDiv.appendChild(node));

    return (parentDiv);
};

/**
 * @param {HTMLElement} parent
 * @param {Array<HTMLElement>} nodes
 * @returns {HTMLElement}
*/
const appendMultipleNodes = (parent, nodes) => {
    nodes.forEach((node) => parent.appendChild(node));

    return (parent);
};

export { createDivAndAppendNodes, appendMultipleNodes };