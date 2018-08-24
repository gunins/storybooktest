/**
 * querySelector wrapper
 *
 * @param {string} selector to query
 * @param {Element|Node} [scope] Optional scope element for the selector
 */
export function qs(selector, scope) {
	return (scope || document).querySelector(selector);
}

/**
 * querySelectorAll wrapper
 *
 * @param {string} selector Selector to query
 * @param {Element} [scope] Optional scope element for the selector
 */
export function qsa(selector, scope) {
	return (scope || document).querySelectorAll(selector);
}

/**
 *
 * @param {dom} el - dom element
 * @param {string} className - dom element class name to find
 * @returns {boolean}
 */
export function hasClass(el, className) {
	let bool;
	if (el.classList) {
		bool = el.classList.contains(className);
	} else {
		bool = new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
	}
	return bool;
}

export function addClass(el, className) {
	if (el.classList)
		el.classList.add(className);
	else
		el.className += ' ' + className;
}

export function removeClass(el, className) {
	if (el.classList)
		el.classList.remove(className);
	else
		el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

export function toggleClass(el, className) {
	if (hasClass(el, className))
		removeClass(el, className);
	else
		addClass(el, className);
}

export function freezePageScroll(ev) {
	// When dropdown is opened we stop page from scrolling and only dropdown will scroll
	if (ev.type === 'mouseenter') {
		document.body.style.overflow = 'hidden';
	} else {
		document.body.style.overflow = '';
	}
}