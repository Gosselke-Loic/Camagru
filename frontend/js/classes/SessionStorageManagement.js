/**
 * @typedef {"profile" | "accessToken"} Keys
*/

class SessionStorageManagement {
	constructor() {}

	/**
	 * @param {string} value
	 * @return { boolean }
	*/
	addAccessTokenToStorage( value ) {
		try {
			sessionStorage.setItem( "accessToken", value );
		} catch (error) {
			return (false);
		};
		return (true);
	};

	/**
	 * @param {string} value
	 * @return { boolean }
	*/
	addProfileToStorage( value ) {
		try {
			sessionStorage.setItem( "profile", value );
		} catch (error) {
			return (false);
		};
		return (true);
	};

	/**
	 * @returns {string | undefined}
	*/
	getAccessTokenFromStorage() {
		const value = sessionStorage.getItem( "accessToken" );
		if (!value)
			return (undefined);
		return (value);
	};

	/**
	 * @returns {import("../utils/interface.js").User | undefined}
	*/
	getUserFromSessionStorage() {
		const value = sessionStorage.getItem( "profile" );
		if (!value)
			return (undefined);
		return (value);
	};

	/**
	 * @param {Keys} key 
	*/
	removeFromSessionStorage ( key ) {
		sessionStorage.removeItem( key );
	};

	removeAllFromSessionStorage () {
		sessionStorage.clear();
	};
};

const sessionStorageManagement = new SessionStorageManagement();
Object.freeze(sessionStorageManagement);

export default sessionStorageManagement;