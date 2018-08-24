import {once} from './dom/eventHandler';
import {lensPath, view} from './utils/lenses';
import {promiseOption} from './utils/option';

const {assign} = Object;
const {body} = document;

const setLocation = (target) => {
    if (target && target !== window.location.href) {
        window.location = target;
    }
};

const createElement = (element, options = {}) => assign(document.createElement(element), {height: 0}, options);

const frameManager = (src) => {
    let frame = false;
    const addFrame = async () => {
        frame = createElement('iframe', {src});
        body.appendChild(frame);
    };
    const removeFrame = async () => {
        if (frame) {
            body.removeChild(frame);
            frame = false;
        }
    };
    return {addFrame, removeFrame}
};

const messageType = view(lensPath('data', 'type'));
const messageTarget = view(lensPath('data', 'target'));

const manageFrame = (src) => {
    const {addFrame, removeFrame} = frameManager(src);

    const finishFrame = _ => promiseOption(messageType(_) === 'tokenUpdated')
        .then(() => removeFrame())
        .then(() => setLocation(messageTarget(_)));

    return () => removeFrame()
        .then(() => addFrame())
        .then(() => once(window, 'message'))
        .then(_ => finishFrame(_));
};

export {manageFrame}