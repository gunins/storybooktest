((window) => {
    'use strict';
    const {DOM} = window.utils;
    const {rootElement} = DOM;
    rootElement('.mdw-action a', ({container, evtBus}) => {

        const el   = container();
        const data = {
            title:       el.dataset('title'),
            name:        el.dataset('name'),
            value:       el.dataset('value'),
            placeholder: el.dataset('placeholder')
        };

        el.on('click touch', e => {
            e.preventDefault();
            evtBus.publish('mdw-btnAction-trigger', data);
        });
    });
})(window);
