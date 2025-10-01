import { apiEndpoints, host, methods } from "./utils.js";
import stateManager from "../classes/StateManager.js";
import managerStatus from "../classes/ManagerStatus.js";
import sessionStorageManagement from "../classes/SessionStorageManagement.js";
import { getMetaContent } from "./csrf_functions.js";

/**
 * @typedef { Object } context
 * @property { Function } callback
 * @property { string } url
 * @property { Object | undefined } params
*/

/* --- */

/**
 * @param {number} length
 * @param {string} method
 * @returns {Headers}
*/
const jsonHeaders = (length, method) => {
	const	headers = new Headers();
	headers.append("Content-Type", "application/json");

	if (length > 0) {
		headers.append("Content-Length", length);
	};

	const valueAccessToken = sessionStorageManagement.getAccessTokenFromStorage();
	if (valueAccessToken) {
		headers.append("Authorization", `bearer ${valueAccessToken}`);
	};

	if (method === methods.post || method === methods.patch || method === methods.delete) {
		const csrfToken = getMetaContent("csrf");
		if (csrfToken) {
			headers.append("x-csrftoken", csrfToken);
		};
	};

	return (headers);
};


/**
 * @returns {Headers}
*/
const formDataHeaders = () => {
	const	headers = new Headers();
	const valueAccessToken = sessionStorageManagement.getAccessTokenFromStorage();
	if (valueAccessToken) {
		headers.append("Authorization", `bearer ${valueAccessToken}`);
	};

	const csrfToken = getMetaContent("csrf");
	if (csrfToken) {
		headers.append("x-csrftoken", csrfToken);
	};

	return (headers);
};

/**
 * @param { Response } response
 * @returns { Promise<import("./interface.js").ParsedResponse> }
*/
const handleResponse = async (response) => {

	if (response.ok && response.statusText === "Access token expired") {
		await POST(apiEndpoints.silentLogout);
		
		stateManager.clearStateAndSessionStorage();
		stateManager.populate();
		managerStatus.displayToast("Access token expired, please log in again.", "text-bg-info", true);

		return ({ ok: false, status: 401, data: { message: "Nothing" } });
	};

	return (managerStatus.parseResponse(response));
};

/* --- */

/**
 * @param {string} url 
 * @returns {Promise<import("./interface.js").ParsedResponse>}
*/
const GET = async (url) => {
	try {
		const response = await fetch(host + url, {
			method: methods.get,
			headers: jsonHeaders(0, methods.get),
			credentials: "same-origin"
		});
		const parsedResponse = await handleResponse(response);
		return (parsedResponse);
	} catch {
		return ({ ok: false, data: { message: "Error: Returning to home" } });
	};
};

/**
 * @param {string} url 
 * @param {Object} params 
 * @returns {Promise<import("./interface.js").ParsedResponse>}
*/
const POST = async (url, params = undefined) => {
	try {
		let body = "";
		if (params)
			body = JSON.stringify(params);
		const response = await fetch(host + url, {
			method: methods.post,
			headers: jsonHeaders(body !== "" ? body.length : 0, methods.post),
			body: body,
			credentials: "same-origin"
		});
		const parsedResponse = await handleResponse(response);
		return (parsedResponse);
	} catch {
		return ({ ok: false, data: { message: "Error: Returning to home" } });
	};
};

/**
 * @param {string} url
 * @param {File} file
 * @returns {Promise<import("./interface.js").ParsedResponse>}
*/
const POST_FORMDATA = async (url, file) => {
	try {
		let bodyContent = new FormData();
		bodyContent.append("file", file);
		const response = await fetch(host + url, {
			method: "POST",
			headers: formDataHeaders(),
			body: bodyContent,
			credentials: "same-origin"
		});
		const parsedResponse = await handleResponse(response);
		return (parsedResponse);
	} catch {
		return ({ ok: false, data: { message: "Error: Returning to home" } });
	};
}

const PATCH = async (url, params) => {
    try {
        let body = "";
		if (params)
			body = JSON.stringify(params);
        const response = await fetch(host + url, {
            method: methods.patch,
            body: body,
            headers: jsonHeaders(body !== "" ? body.length : 0, methods.patch),
            credentials: "same-origin"
        });
        const parsedResponse = await handleResponse(response);
		return (parsedResponse);
    } catch {
		return ({ ok: false, data: { message: "Error: Returning to home" } });
    };
};

/**
 * @param {string} url 
 * @returns {Promise<import("./interface.js").ParsedResponse>}
*/
const DELETE = async (url) => {
	try {
		const response = await fetch(host + url, {
			method: methods.delete,
			headers: jsonHeaders(0, methods.delete, url),
			credentials: "same-origin"
		});
		const parsedResponse = await handleResponse(response);
		return (parsedResponse);
	} catch {
		return ({ ok: false, data: { message: "Error: Returning to home" } });
	}
};

export { 
	GET,
	POST,
	PATCH,
	DELETE,
	POST_FORMDATA
};