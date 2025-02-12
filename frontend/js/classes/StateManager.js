import refreshNavbar from "../components/navbar.js";

class StateManager {
    #user;
    #loaded;
    #logged;

    constructor () {
        this.#loaded = false;
        this.#logged = false;
        this.#user = undefined;
    }

    get getUser() {
        return (this.#user);
    }

    get getLoaded() {
        return (this.#loaded);
    }

    get getLogged() {
        return (this.#logged);
    }

    get getUserID() {
        return (this.#user?.id ? this.#user.id : undefined);
    }

    /**
    * @param {Object} value
    */
    set setUser(value) {
        this.#user = value;
    }

    /**
     * @param {boolean} value
     */
    set setLoaded(value) {
        this.#loaded = value;
    }

    /**
     * @param {boolean} value
     */
    set setLogged(value) {
        this.#logged = value;
    }

    /* loads states */

    populate() {
        this.setLoaded = false;
        refreshNavbar();
        this.setLoaded = true;
    }

    reloadJsFile(path) {
        const exec = routes_template[path];
        if (exec && this.getLoaded)
            exec();
    }

    async loadFragmentPage (path, toPush = history_state.push) {
        /*this.setLoaded = false;
        const response = await GET(path, true);
        if (!response.ok) {
            managerStatus.handleErrorResponse(
                response.status,
                "Error trying to load a page",
                true
            );
            return ;
        }
    
        let toastContainer;
        const content = document.getElementById("content");
        while (content.lastElementChild) {
            if (content.lastElementChild.id === "no_remove")
                toastContainer = content.lastElementChild;
            content.removeChild(content.lastElementChild);
        };
    
        document.title = response.data.name;

        const parser = new DOMParser();
        const doc = parser.parseFromString(response.data.content, "text/html").body;
        doc.childNodes.forEach((node) => {
            content.appendChild(node);
        });

        if (toastContainer) {
            content.appendChild(toastContainer);
        } else {
            managerToast.init();
        }       

        if (toPush === history_state.push)
            window.history.pushState("", "", path);
        else if (toPush === history_state.replace)
            window.history.replaceState("", "", path);

        this.setLoaded = true;
        this.reloadJsFile(path);
        this.listeningAnchors();*/
    };

    listeningAnchors() {
        const anchors = document.querySelectorAll(".link_to");
        if (anchors) {
            anchors.forEach((anchor) => {
                anchor.addEventListener("click", () => {
                    const path = anchor.dataset.path;
                    this.loadFragmentPage(path);
                });
            });
        }
    }

    /* Handling states */

    async self() {
        /*const response = await GET_SELF(endpoints.userDetails("me"));
        if (response.ok) {
            const user = response.data;
            this.setLogged = true;
            this.setUser = {
                id: user.id,
                avatar: user.avatar,
                remote_user: user.remote_user,
                username: user.username,
				enable_2fa: user.enable_2fa
            };
        } else {
            this.setLogged = false;
            this.setUser = undefined;
        }*/
    }

    async logout() {
        /*const response = await POST_JSON( undefined, endpoints.logout );

        if (!response.ok) {
            managerStatus.handleErrorResponse(response.status, response.data, false);
            return;
        }
        this.setLogged = false;
        this.setUser = undefined;
        const path = window.location.pathname;
        if (path !== "/")
            this.loadFragmentPage(endpoints.home, history_state.replace);
        this.populate();
        closeChatSocket();
        managerToast.makeToast({
            message: "Logout succesfull!",
            clickable: false,
            toast_color: colorToast.green
        });*/
    }

    /*async login( toSend ) {
        const response = await POST_MULTIPART( toSend, endpoints.login );

        if (!response.ok) {
            managerStatus.handleErrorResponse(response.status, response.data, false);
            return;
        }
        const data = response.data;
        if (response.status === 202 && data.redirect_url) {
            this.loadFragmentPage(data.redirect_url, history_state.replace);
            this.populate();
        } else if (response.status === 200) {
            this.setLogged = true;
            await this.self();
            this.loadFragmentPage(endpoints.home, history_state.replace);
            this.populate();

            managerToast.makeToast({
                message: "Login succesfull!",
                clickable: false,
                toast_color: colorToast.green
            });
        }
	}

    async register( toSend ) {
        const response = await POST_MULTIPART( toSend, endpoints.register );
        const data = response.data;
       
        if (!response.ok) {
            managerStatus.handleErrorResponse(response.status, response.data, false);
		}
        if (response.status === 201) {
            if (data.otp_provisioning_url) {
                await this.showQRCode(data.otp_provisioning_url);
            }
        managerToast.makeToast({
            message: "Registration successful. Please log in.",
            clickable: false,
            toast_color: colorToast.green
        });
        this.loadFragmentPage(data.redirect_url, history_state.replace);
        }
    }

	async settings(toSend) {
        const formData = new FormData();
        let changesDetected = false;
        // Check and append only modified fields
        if (toSend.username && toSend.username !== this.getUser?.username) {
            formData["username"] = toSend.username;
            changesDetected = true;
        }

        if (toSend.nickname && toSend.nickname !== this.getUser?.nickname) {
            formData["nickname"] = toSend.nickname;
            changesDetected = true;
        }

        if (toSend.email && toSend.email !== this.getUser?.email) {
            formData["email"] = toSend.email;
            changesDetected = true;
        }

        if (toSend.password) {
			formData["password"] = toSend.password;
            changesDetected = true;
        }
        
		if (this.getUser?.enable_2fa === undefined && toSend.enable_2fa === "none") {
			toSend.enable_2fa = undefined
		}

        if (toSend.enable_2fa && toSend.enable_2fa !== this.getUser?.enable_2fa) {
			
            formData["enable_2fa"] = toSend.enable_2fa;
            changesDetected = true;
        }

        if (toSend.avatar) {
			formData["avatar"] = toSend.avatar;
            changesDetected = true;
        }

        // Inform the user if no changes were detected
        if (!changesDetected) {
            managerToast.makeToast({
                message: "No changes detected. Please modify at least one field.",
                clickable: false,
                toast_color: colorToast.blue
            });
            return;
        }

        const response = await PATCH_MULTIPART(formData, endpoints.userDetails(this.getUserID));

        if (!response.ok) {
            managerStatus.handleErrorResponse(response.status, response.data, false);
            return;
        }
        const responseData = response.data;

        if (toSend.enable_2fa === "totp" && toSend.enable_2fa !== this.getUser?.enable_2fa) {
            if (responseData.otp_provisioning_url) {
                await this.showQRCode(responseData.otp_provisioning_url);
            } else {
                // alert("Failed to retrieve QR code URL.");
                managerToast.makeToast({
                    message: "Failed to retrieve QR code URL.",
                    clickable: false,
                    toast_color: colorToast.blue
                });
                return;
            }
        }

        managerToast.makeToast({
            message: "Settings updated successfully!",
            clickable: false,
            toast_color: colorToast.green
        });

        if ((toSend.username && toSend.username !== this.getUser?.username) || toSend.avatar) {
            await this.self();
			closeChatSocket();
            this.loadFragmentPage("/settings/", history_state.replace);
            this.populate();
        } else {
            await this.self();
            this.loadFragmentPage("/settings/", "replace");
        }
        
    }*/
}

const stateManager = new StateManager();
Object.freeze(stateManager);

export default stateManager;