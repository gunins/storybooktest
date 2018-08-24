export default class {
	constructor() {
		this.events = {};
	}

	set(method) {
		if (this.events[method] === method) return;
		this.events[method] = method;
	}

	get(method) {
		if (this.events[method]) {
			return this.events[method];
		}
	}
}