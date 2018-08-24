const {keys} = Object;
const {style} = document.createElement('fakeelement');

const find = (animations) => animations[keys(animations).find(animation => style[animation] !== undefined)];

const transitionEvent = () => find({
    'transition':       'transitionend',
    'OTransition':      'oTransitionEnd',
    'MozTransition':    'transitionend',
    'WebkitTransition': 'webkitTransitionEnd'
});

const animationEvent = () => find({
    'animation':       'animationend',
    'OAnimation':      'oAnimationEnd',
    'MozAnimation':    'animationend',
    'WebkitAnimation': 'webkitAnimationEnd'
});


const on = (el, ev, cb, context, ...args) => {
    const events = ev.split(' ');

    const fn = (e) => {
        cb.apply(context, [e, el].concat(args));
    };

    events.forEach((event) => {
        el.addEventListener(event, fn);
    });
    return {
        remove() {
            events.forEach(event => el.removeEventListener(event, fn));
        }
    }
};

const once = (el, ev, context, ...args) => new Promise((resolve) => {
    const event = on(el, ev, _ => {
        resolve(_);
        event.remove();
    }, context, ...args);
});

export {on, once, animationEvent, transitionEvent};