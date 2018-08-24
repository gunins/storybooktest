const hasClassES5 = (el, className) => new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);

const hasClass = (el, className) => el.classList ? el.classList.contains(className) : hasClassES5(el, className);

const addClassES5 = (el, className) => {
    el.className += ' ' + className;
};

const addClass = (el, className) => el.classList ? el.classList.add(className) : addClassES5(el, className);

const removeClassES5 = (el, className) => {
    el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
};

const removeClass = (el, className) => el.classList ? el.classList.remove(className) : removeClassES5(el, className);

const toggleClassES5 = (el, className) => {
    const has = hasClass(el, className);
    if (has) {
        removeClass(el, className);
    }
    else {
        addClass(el, className);
    }
    return has;
};

const toggleClass = (el, className) => el.classList ? el.classList.toggle(className) : toggleClassES5(el, className);

const getClass = ({classList}) => classList[0];
const setModifier = (el, modifier) => [getClass(el), modifier.replace(/^_/, '')].join('_')

const addModifier = (el, modifier) => addClass(el, setModifier(el, modifier));
const removeModifier = (el, modifier) => removeClass(el, setModifier(el, modifier));
const hasModifier = (el, modifier) => hasClass(el, setModifier(el, modifier));


export {hasClass, removeClass, toggleClass, addClass, addModifier, hasModifier, removeModifier};