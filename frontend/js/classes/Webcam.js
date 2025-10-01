import managerStatus from "./ManagerStatus.js";
import { 
    createDiv,
    createImage,
    createButton,
    elementGenerator
} from "../components_parts/common_components.js";
import stateManager from "../classes/StateManager.js";
import { GET, POST, POST_FORMDATA } from "../utils/api.js";
import { apiEndpoints, stickersPaths } from "../utils/utils.js";
import { createDivAndAppendNodes } from "../utils/components_utils.js";

export default class Webcam {
 
    /** @type { HTMLVideoElement | undefined } */
    #video;
    /** @type { HTMLCanvasElement | undefined } */
    #canvas;
    /** @type {number} */
    #width;
    /** @type {number} */
    #height;
    /** @type { File } */
    #lastFile;
    /** @type {boolean} */
    #streaming;
    /** @type {HTMLButtonElement} */
    #sendButtonElement;
    /** @type { string } */
    #currentSelection;

    constructor() {
        this.#height = 0;
        this.#width = 720;
        this.#video = undefined;
        this.#streaming = false;
        this.#canvas = undefined;
        this.#lastFile = undefined;
        this.#currentSelection = undefined;
        this.#sendButtonElement = undefined;
    }

    get #getWidth() {
        return (this.#width);
    }

    get #getVideo() {
        return (this.#video);
    }
    
    get #getHeight() {
        return (this.#height);
    }

    get #getCanvas() {
        return (this.#canvas);
    }

    get #getLastFile() {
        return (this.#lastFile);
    }

    get #getStreaming() {
        return (this.#streaming);
    }

    get #getCurrentSelection() {
        return (this.#currentSelection);
    }

    get #getsendButtonElement() {
        return (this.#sendButtonElement);
    }

    /** @param { number } value */
    set #setHeight(value) {
        this.#height = value;
    }

    /** @param { HTMLVideoElement } value */
    set #setVideo(value) {
        this.#video = value;
    }

    /** @param { HTMLVideoElement } value */
    set #setCanvas(value) {
        this.#canvas = value;
    }

    /** @param { File } value */
    set #setLastFile(value) {
        this.#lastFile = value;
    }

    /** @param { boolean } value */
    set #setStreaming(value) {
        this.#streaming = value;
    }

    /** @param { string } value */
    set #setCurrentSelection(value) {
        this.#currentSelection = value;
    }

    /** @param { HTMLButtonElement } value */
    set #setsendButtonElement(value) {
        this.#sendButtonElement = value;
    }

    /* Micro components */

    /**
     * @param {import("../utils/interface.js").ParsedResponse} response
     * @param {import("../utils/interface.js").User} user 
     * @returns {HTMLDivElement}
    */
    createRecentImages(response, user) {
        const recentPhotosDiv = createDiv("card col-12 ss_mb");

        const h5 = elementGenerator("h5", {
            id: undefined,
            classAttributes: "p-2 text-center fw-bold text-decoration-underline",
            content: "Recents photos"
        });
        recentPhotosDiv.appendChild(h5);

        const recentPhotosList = createDiv("row d-flex justify-content-center ls_overflow");
        recentPhotosList.id = "recents_photos";

        const { images } = response.data;
        for (const image of images) {
            const img = createImage({
                src: `uploads/${image.href}`,
                alt: `Image number ${image.image_id} of ${user.username}`,
                styles: "img-fluid col-12 col-md-2 pb-1",
                id: undefined
            })
            recentPhotosList.appendChild(img);
        };

        recentPhotosDiv.appendChild(recentPhotosList);
        
        return (recentPhotosDiv);
    }

    /**
     * @returns {HTMLVideoElement}
    */
    createVideo() {
        const videoContainer = createDiv(
            "d-flex justify-content-center align-items-center padding_bottom ls_video_pb"
        );

        /** @type {HTMLVideoElement} */
        const video = elementGenerator("video", {
            id: "video",
            classAttributes: "card-body text-center",
            content: "Video stream not available"
        });
        video.addEventListener("canplay", () => {
            if (!this.#getStreaming) {
                this.#setHeight = (video.videoHeight / video.videoWidth) * this.#getWidth;

                video.setAttribute("width", this.#getWidth);
                video.setAttribute("height", this.#getHeight);
                canvas.setAttribute("width", this.#getWidth);
                canvas.setAttribute("height", this.#getHeight);
                this.#setStreaming = true;
            };
        }, false);

        this.#setVideo = video;
        videoContainer.appendChild(video);
        
        return (videoContainer);
    }

    /**
     * @returns {HTMLCanvasElement}
    */
    createCanvas() {
        /** @type {HTMLCanvasElement} */
        const canvas = elementGenerator("canvas", {
            id: "canvas",
            classAttributes: undefined,
            content: undefined
        });
        canvas.style.display = "none";
        this.#setCanvas = canvas;

        return (canvas);
    }

    /**
     * @returns {HTMLDivElement} 
    */
    createPhotoContainer() {
        /** @type {HTMLDivElement} */
        const photoContainer = createDiv(
            "col-12 col-md-6 pb-3 d-flex justify-content-center align-items-center"
        );
        const photo = createImage({
            src: "./public/noPreview.png",
            alt: "The screen capture will appear in this box.",
            styles: "img-fluid",
            id: "photo"
        });
        photo.width = 352;
        photo.height = 240;
        photoContainer.appendChild(photo);

        return (photoContainer);
    }

    /**
     * @returns {HTMLDivElement} 
    */
    createInputFile() {
        const parentDiv = createDiv("");
        const wrap = createDiv("col-12 col-md-6 d-flex justify-content-center align-items-center");

        const label = document.createElement("label");
        label.setAttribute("for", "input_file");
        label.setAttribute("class", "form-label mb-1");
        label.textContent = "Upload an existing image";

        const input = document.createElement("input");
        input.id = "input_file";
        input.type = "file";
        input.accept = ".jpeg, .jpg";
        input.setAttribute("required", "");
        input.setAttribute("class", "form-control form-control-lg");
        input.addEventListener("change", () => {

            if (input.files.length === 1) {
                const file = input.files[0];
                if (file) {
                    const fileName = file.name;
                    const fileExtension = fileName.split('.').pop().toLowerCase();

                    const extensions = ["jpg", "jpeg"];
                    if (!extensions.includes(fileExtension)) {
                        managerStatus.displayToast("Invalid file extension, please try with another file", "text-bg-info");
                        input.value = null;
                        return ;
                    };

                    this.#setLastFile = file;

                    const button = this.#getsendButtonElement;
                    if (this.#currentSelection === undefined || this.#getLastFile === undefined) {
                        button.disabled = true;
                    } else {
                        button.disabled = false;
                    };
                } else {
                   managerStatus.displayToast("Error to trying to upload the file, please retry again", "text-bg-info");
                };
            };

        }, false);

        parentDiv.appendChild(label);
        parentDiv.appendChild(input);
        wrap.appendChild(parentDiv);

        return (wrap);
    }

    /**
     * @returns {HTMLDivElement} 
    */
    createButtons() {
        const button1 = createButton(
            "takePicture",
            "button",
            { styles: "btn btn-primary me-2 btn-lg", content: "Take a picture" }
        );
        button1.addEventListener("click", (ev) => {
            ev.preventDefault();
            this.takePicture();
        }, false);

        const button2 = createButton(
            "sendPicture",
            "button",
            { styles: "btn btn-success btn-lg", content: "Send!" }
        );
        button2.disabled = true;
        button2.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            this.handleNewPicture();
        });
        this.#setsendButtonElement = button2;

        const buttonContainer = createDivAndAppendNodes(
            "col-12 d-flex justify-content-center align-items-center padding_bottom py-2",
            [button1, button2]
        );

        return (buttonContainer);
    }

    /**
     * @returns {HTMLDivElement}
    */
    createStickers() {
        const stickersDiv = createDiv("card col-12 col-md-3 border border-2 rounded ss_mb ls_mb");

        const h5 = elementGenerator("h5", {
            id: undefined,
            classAttributes: "p-2 text-center fw-bold text-decoration-underline",
            content: "Choose an sticker"
        });
        stickersDiv.appendChild(h5);

        const stickersList = createDiv("border mb-3 overflow-y-auto");
        stickersList.id = "stickers";
        stickersList.style.maxHeight = "48rem";

        for (let index = 0; index < stickersPaths.length; index++) {
            const element = stickersPaths[index];

            const img = createImage({
                src: `/uploads/stickers/${element.src}`,
                alt: element.alt,
                styles: "img-fluid col-12 col-md pb-4",
                id: `sticker_${index}`
            })
            img.setAttribute("data-reference", element.src);

            img.addEventListener("click", () => {
                if (this.#getCurrentSelection) {
                    const element = document.getElementById(this.#getCurrentSelection);
                    element.classList.remove("sticker_selected");
                };
                
                this.#setCurrentSelection = img.id;
                img.classList.add("sticker_selected");

                const button = this.#getsendButtonElement;
                if (this.#currentSelection === undefined || this.#getLastFile === undefined) {
                    button.disabled = true;
                } else {
                    button.disabled = false;
                };
            });

            stickersList.appendChild(img);
        };

        stickersDiv.appendChild(stickersList);

        return (stickersDiv);
    }

    /*  */

    /** @returns {Promise<HTMLDivElement | undefined>} */
    async createWebcamPage() {
        const wrap = createDiv("row padding_top");
        const card = createDiv("card col-12 col-md-9 ss_mb ls_mb");

        {
            /** @type {HTMLVideoElement} */
            const videoContainer = this.createVideo();
            card.appendChild(videoContainer);
        }

        {
            /** @type {HTMLCanvasElement} */
            const canvas = this.createCanvas();
            card.appendChild(canvas);
        }

        {
            /** @type {HTMLDivElement} */
            const photoContainer = this.createPhotoContainer();

            /** @type {HTMLDivElement} */
            const inputContainer = this.createInputFile();

            /** @type {HTMLDivElement} */
            const buttonsContainer = this.createButtons();

            const footerContainer = createDivAndAppendNodes(
                ("row d-flex justify-content-evenly pt-3"),
                [photoContainer, inputContainer, buttonsContainer]
            );

            card.appendChild(footerContainer);
            wrap.appendChild(card);
        }

        {
            /** @type {HTMLDivElement} */
            const stickersDiv = this.createStickers();
            wrap.appendChild(stickersDiv);
        }

        {
            const user = stateManager.getUser;
            const response = await GET(`${apiEndpoints.image}?user=${user.user_id}&limit=5`);
            if (!response.ok) {
                const { message } = response.data;
                if (message === "Nothing") {
                    return (undefined);
                };

                managerStatus.displayToastError(response.data.message, response.status, true);
                return (undefined);
            };

            const recentPhotosDiv = this.createRecentImages(response, user);
            wrap.appendChild(recentPhotosDiv);
        }

        const parent = createDiv(
            "fill_div container-fluid d-flex align-items-center justify-content-center"
        );

        parent.appendChild(wrap);
        return (parent);
    }

    async initWebcamLogic() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    width: { min:1024, ideal: 1600, max: 2048 },
                    height: { min: 768, ideal: 1200, max: 1536 }
                }
            });

            if (stream) {
                stateManager.setStream = stream;

                /** @type {HTMLVideoElement} */
                const video = this.#getVideo;
                if (video) {
                    video.srcObject = stream;
                    video.onloadedmetadata = function () {
                        video.play();
                    };
                    return ;
                };
            };

            managerStatus.displayToastError(
                "Error: The webcam could not be started",
                undefined,
                true
            );
        } catch (error) {
            /** @type {HTMLButtonElement} */
            const takePictureButton = document.getElementById("takePicture");
            takePictureButton.disabled = true;
            managerStatus.displayToast("Webcam unavailable", "text-bg-info");
        };
    }

    async takePicture() {
        const width = this.#getWidth;
        const canvas = this.#getCanvas;
        const height = this.#getHeight;

        if (canvas) {
            const context = canvas.getContext("2d");

            const video = this.#getVideo;
            if (!video) {
                managerStatus.displayToastError("Webcam not available, returning home", true);
                return ;
            };

            canvas.width = width;
            canvas.height = height;

            context.drawImage(video, 0, 0, width, height);
            const data = canvas.toDataURL("image/jpeg");
            canvas.toBlob((blob) => {
                const user = stateManager.getUser;
                const file = new File([blob], `${user.username}_screenshot`);
                this.#setLastFile = file;
            }, "image/jpeg");

            const button = this.#getsendButtonElement;
            if (this.#currentSelection === undefined) {
                button.disabled = true;
            } else {
                button.disabled = false;
            };

            /** @type {HTMLImageElement} */
            const photo = document.getElementById("photo");
            photo.src = data;
        } else {
            managerStatus.displayToastError("Canvas not available, returning home", true);
        }
    }

    async handleNewPicture() {
        if (!this.#getLastFile || !this.#getCurrentSelection) {
            managerStatus.displayToast("You must first take a picture or select a sticker", "text-bg-info");
            return ;
        };

        const button = this.#getsendButtonElement;
        button.disabled = true;

        const response = await POST_FORMDATA(
            `${apiEndpoints.image}?type=sample`, this.#getLastFile
        );

        if (!response.ok) {
            const { message } = response.data;
            if (message === "Nothing") {
                return ;
            };

            managerStatus.displayToastError(
                message ? message : "Error: returning to home",
                response.status
            );
            return ;
        };

        const sticker = document.getElementById(this.#getCurrentSelection);
        const response2 = await POST(apiEndpoints.image, {
            href: response.data.image.href,
            original_file_name: response.data.image.original_file_name,
            sticker: sticker.dataset.reference
        });

        if (!response2.ok) {
            const { message } = response2.data;
            if (message === "Nothing") {
                return ;
            };

            managerStatus.displayToastError(
                "Error: file image is smaller than the sticker size",
                response.status
            );

            return ;
        };

        const user = stateManager.getUser;
        const response3 = await GET(`${apiEndpoints.image}?user=${user.user_id}&limit=5`);
        if (!response.ok) {
            const { message } = response3.data;
            if (message === "Nothing") {
                return ;
            };

            managerStatus.displayToastError(response3.data.message, response3.status, true);
            return ;
        };
        
        const recentImages = document.getElementById("recents_photos");
        if (!recentImages) {
            managerStatus.displayToastError("Failed to fetch recent images", undefined);
            button.disabled = false;
            return ;
        };

        while (recentImages.lastElementChild) {
            recentImages.removeChild(recentImages.lastElementChild);
        };

        const { images } = response3.data;
        for (const image of images) {
            const img = createImage({
                src: `uploads/${image.href}`,
                alt: `Image number ${image.image_id} of ${user.username}`,
                styles: "img-fluid col-12 col-md-2 pb-1",
                id: undefined
            })
            recentImages.appendChild(img);
        };

        button.disabled = false;
    }
};