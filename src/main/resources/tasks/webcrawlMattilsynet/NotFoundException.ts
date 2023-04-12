export default class NotFoundException extends Error {
	constructor(url: string, options?: ErrorOptions) {
		// Need to pass `options` as the second parameter to install the "cause" property.
		super(`${url} 404 Not Found`, options); // 'Error' breaks prototype chain here
		this.name = 'NotFoundException';
		if (Object.setPrototypeOf) { // Runtime might not have it
			Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
		}
	}
}
