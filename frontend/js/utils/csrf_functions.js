/**
 * @param {string} metaName
 * @param {string} content
 * @returns {void}
*/
const insertMetaContent = (metaName, content) => {
    const metas = document.getElementsByTagName('meta');

    for (let i = 0; i < metas.length; i++) {
        if (metas[i].getAttribute('name') === metaName) {
            metas[i].setAttribute("content", content);
        };
    };
};

/**
 * @param {string} metaName
 * @returns {string | undefined}
*/
const getMetaContent = (metaName) => {
    const metas = document.getElementsByTagName('meta');

    for (let i = 0; i < metas.length; i++) {
        if (metas[i].getAttribute('name') === metaName) {
            return metas[i].getAttribute("content");
        }
    }

    return (undefined);
};

export { getMetaContent, insertMetaContent  };