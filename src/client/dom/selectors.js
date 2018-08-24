const qs = (selection, container) => {
    const el = (container || document).querySelector(selection);
    if (!el) {
        throw `${selection} not found`;
    }
    return el;
};


const qsAll = (selection, container) => Array.from((container || document).querySelectorAll(selection));

const element = (selector, container) => {
    const els = qsAll(selector, container);
    return (fn) => els.map((el, index) => fn(el, index));
};


const select = (selector, cb) => (el) => cb(el.querySelector(selector));
const selectAll = (selector, cb) => (el) => cb(el.querySelectorAll(selector));


export {qs, qsAll, element, select, selectAll};