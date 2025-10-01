import { GET } from "../utils/api.js";
import createPagination from "./pagination.js";
import { apiEndpoints } from "../utils/utils.js";
import stateManager from "../classes/StateManager.js";
import managerStatus from "../classes/ManagerStatus.js";
import { createDiv, createImage } from "../components_parts/common_components.js";

/**
 * @returns {Promise<HTMLDivElement>} 
*/
const createHome = async () => {
    const wrapperDiv = createDiv(undefined);
    const parentDiv = createDiv(
        "fill_div container-fluid text-center d-flex align-items-center justify-content-center"
    );

    const currentPage = stateManager.getHomeIndexPage;
    const response = await GET( `${apiEndpoints.image}?page=${currentPage}` );

    if (!response.ok) {
        if (!response.data) {
            managerStatus.displayToastError("Error", response.status);
            return ;
        };

        const { message } = response.data;
        if (message === "Nothing") {
            return ;
        };

        managerStatus.displayToastError(message, response.status);

        return ;
    };

    if (response.data && response.data.images.length !== 0) {
        const { total, images } = response.data;
        const gridDiv1 = createDiv("row");
        const gridDiv2 = createDiv("row");
    
        for (const [index, image] of images.entries()) {
            const colDiv = createDiv("col-12 col-md-12 col-lg");
            const imageTag = createImage({
                src: `uploads/${image.href}`,
                alt: image.original_file_name,
                styles: "img-fluid home_image",
                id: image.image_id
            });

            colDiv.appendChild(imageTag);
            if (index <= 1) {
                gridDiv1.appendChild(colDiv);
            } else {
                gridDiv2.appendChild(colDiv);
            }
        }

        wrapperDiv.appendChild(gridDiv1);
        wrapperDiv.appendChild(gridDiv2);

        const pagination = createPagination(total, currentPage);
        wrapperDiv.appendChild(pagination);
    };

    parentDiv.appendChild(wrapperDiv);

    return (parentDiv);
};

export default createHome;