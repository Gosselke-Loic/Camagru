/**
 * @typedef {Object} options
 * @property {string} styles
 * @property {string} content
*/

/**
 * @typedef {Object} optionsElement
 * @property {string} id
 * @property {string} classAttributes
 * @property {string} content
*/

/**
 * @typedef {Object} optionsImage
 * @property {string} src
 * @property {string} alt
 * @property {string} styles
 * @property {string | undefined} id
*/

/*  */

/**
 * @param {keyof HTMLElementTagNameMap} type
 * @param {optionsElement} options
 * @returns {HTMLElement}
 */
const elementGenerator = (type, options) => {
    const element = document.createElement(type);

    if (options.id) {
        element.id = options.id;
    };
        
    if (options.classAttributes) {
        element.setAttribute("class", options.classAttributes);
    };
        
    if (options.content) {
        element.textContent = options.content;
    };

    return (element);
}

/**
 * @param {string} styles 
 * @returns {HTMLDivElement}
*/
const createDiv = (styles) => {
    const element = document.createElement("div");
    if (styles)
        element.setAttribute("class", styles);
    return (element);
};

/**
 * @param {optionsImage} options
 * @returns {HTMLImageElement}
*/
const createImage = (options) => {
    const image = document.createElement("img");
    if (options.src)
        image.src = options.src;
    if (options.alt)
        image.alt = options.alt;
    if (options.styles)
        image.setAttribute("class", options.styles);
    if (options.id)
        image.id = options.id;
    return (image);
};

/**
 * @param {string | undefined} id optional
 * @param {"button" | "reset" | "submit"} type
 * @param {options} options
 * @returns {HTMLButtonElement} 
*/
const createButton = (id, type, options) => {
    const button = document.createElement("button");
    if (id) {
        button.id = id;
    };

    if (type !== "button" && type !== "reset" && type !== "submit") {
        button.type = "button";
    } else {
        button.type = type;
    }

    button.setAttribute("class", options.styles);
    button.textContent = options.content;
    return (button);
};

/**
 * 
 * @param {string} id optional
 * @param {boolean} role if true role is button for anchor
 * @param {*} options { styles: string, content: string } 
 * @returns {HTMLAnchorElement}
 */
const createAnchor = (id, role, options) => {
    const anchor = document.createElement("a");
    if (id)
        anchor.id = id;
    if (role)
        anchor.role = "button";
    anchor.setAttribute("class", options.styles);
    anchor.textContent = options.content;
    return (anchor);
};

/**
 * @param {string} textContent
 * @returns {HTMLDivElement}
*/
const createGenericCardHeader = (textContent) => {
    const header = createDiv("card-header bg-transparent text-center");

    const h2 = document.createElement("h2");
    h2.setAttribute("class", "m-0");
    h2.textContent = textContent;

    header.appendChild(h2);
    
    return (header);
};

export {
    createDiv,
    createImage, 
    createAnchor,
    createButton,
    elementGenerator,
    createGenericCardHeader
};