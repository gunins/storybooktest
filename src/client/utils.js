import Memoize from './Memoize';
import PubSub from './PubSub';
let memoize = new Memoize();
let pubSub = new PubSub();

let utils = {

	/**
	 * Element distance from browser top border
	 * @param el DOM
	 * @returns {{x: number, y: number}}
	 */
	getPosition(el) {
		let xPos = 0;
		let yPos = 0;

		while (el) {
			if (el.tagName == "BODY") {
				// deal with browser quirks with body/window/document and page scroll
				let xScroll = el.scrollLeft || document.documentElement.scrollLeft;
				let yScroll = el.scrollTop || document.documentElement.scrollTop;

				xPos += (el.offsetLeft - xScroll + el.clientLeft);
				yPos += (el.offsetTop - yScroll + el.clientTop);
			} else {
				// for all other non-BODY elements
				xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
				yPos += (el.offsetTop - el.scrollTop + el.clientTop);
			}

			el = el.offsetParent;
		}
		return {
			x: xPos,
			y: yPos
		};
	},

	/**
	 * Loops through all parents and check if clicked Element is same as Node (needle)
	 *
	 * @param el {Element}
	 * @param needle {Element}
	 * @returns {boolean}
	 */
	isCurrentEl(el, needle) {
		let isNeedle = false;
		while (el) {
			if (el.isEqualNode(needle)) {
				//console.log('--- el.tagname, needle', el, needle);
				isNeedle = true;
				break
			}
			el = el.offsetParent;
		}
		return isNeedle;
	},
	/**
	 * Finds the closest element by moving up through parents
	 * @param elem {Element} to start
	 * @param s {String} DOM element to find
	 * @param root {Element} optional
	 * @returns {Element | null}
	 *
	 */
	getClosest(elem, s, root = document) {
		let matches = root.querySelectorAll(s),
			el = elem,
			i;
		do {
			i = matches.length;
			while (--i >= 0 && matches.item(i) !== el) {}
		} while ((i < 0) && (el = el.parentElement));
		return el;
	},

	/**
	 *
	 * @param event - string 'scroll' or 'resize'
	 * @param method - function to run
	 */
	binder(event, method) {
		let ticking = false;
//TODO: option to wait till resize is over and then adjust
		window.addEventListener(event, function () {
			if (!ticking) {
				window.requestAnimationFrame(function () {
					method();
					ticking = false;
				});
			}
			ticking = true;
		});
	},

	/**
	 *
	 * @returns {{x: (Number|number), y: (Number|number)}}
	 */
	screenSize() {
		let w = window,
			d = document,
			e = d.documentElement,
			g = d.getElementsByTagName('body')[0],
			x = w.innerWidth || e.clientWidth || g.clientWidth,
			y = w.innerHeight || e.clientHeight || g.clientHeight;

		return {x: x, y: y}
	},

	/**
	 *
	 * @param el string
	 * @returns {Element}
	 */

	make(el) {
		return document.createElement(el);
	},

	/**
	 *
	 * @param {Array} elems - DOM element(s), single element must be wrapped in []
	 * @param {Array} events - ['click', 'resize', '..']
	 * @param {Function} method to attach listener
	 * @param {boolean} option - Optional parameter
	 */
	on(elems, events, method, option = false) {
		if (!elems.length) return;
		memoize.set(method);
		for (let el of elems) {
			for (let event of events) {
				if (memoize.get(method)) {
					el.addEventListener(event, memoize.get(method), option);
				}
			}
		}
	},

	/**
	 *
	 * @param {Array} elems - DOM element(s), single element must be wrapped in []
	 * @param {Array} events - ['click', 'resize', '..']
	 * @param {Function} method to attach listener
	 * @param {boolean} option - Optional parameter
	 */
	off(elems, events, method, option = false) {
		if (!elems.length) return;
		let m = memoize.get(method);
		for (let el of elems) {
			for (let event of events) {
				el.removeEventListener(event, m, option);
			}
		}
	},

	/**
	 *
	 * @param property - string CSS3
	 * @returns string || null
	 */
	css3Support(property) {
		const prop = {
			transform: ["transform", "msTransform", "webkitTransform", "mozTransform", "oTransform"]
		};

		//searching trough array of props and if browser understand it - return it
		for (let i = 0; i < prop[property].length; i++) {
			if (typeof document.body.style[prop[property][i]] != "undefined") {
				return prop[property][i];
			}
		}
		return null;
	},

	pubSub() {
		return pubSub;
	},

	simulateClick(el) {
		let event = new MouseEvent('click', {
			'view': window,
			'bubbles': true,
			'cancelable': true
		});

		let cancelled = !el.dispatchEvent(event);
		if (cancelled) {
			// A handler called preventDefault.
			//console.log('event canceled');
		} else {
			// None of the handlers called preventDefault.
			//console.log('not cancelled');
		}
	}
};

export default utils;

