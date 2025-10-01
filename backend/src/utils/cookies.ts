const getCookie = (cookies: string | undefined , key: string): string | undefined => {
	if (cookies && cookies !== '') {
		const cookiesArray = cookies.split(';');
		for (let i = 0; i < cookiesArray.length; i++) {
			const cookie = cookiesArray[i].trim();
			if (cookie.substring(0, key.length + 1) === (key + '=')) {
				return (decodeURIComponent(cookie.substring(key.length + 1)));
			}
		}
	}
	return (undefined);
};

export { getCookie };