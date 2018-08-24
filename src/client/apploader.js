import {task} from '../functional/core/Task';
import {get} from '../functional/async/Fetch';
import {lensPath, view} from './utils/lenses';
import {compose} from "./utils/curry";

import registerApp from './dom/registerApp'

const promiseSerial = (functions) => functions.reduce((promise, func) => promise.then(result => func(result)), Promise.resolve());

const {assign} = Object;

const origin = view(lensPath('location', 'origin'))(window);

const addHeaders = task(req => assign(req, {
    credentials: 'include',
    headers:     {
        'x-local-request': 'yes',
        'x-contenttype':   'json'
    }
}));

const removePort     = string => string.replace(/^:[0-9]{1,4}(.*)/, '$1');
const removeDomain   = string => string.replace(/^\.[a-z]{2,3}(.*)/, '$1');
const removeIP       = string => string.replace(/^[a-z]{4,5}:\/{2}[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}]+(.*)/, '$1');
const removeLocation = string => string.replace(/^[a-z]{4,5}:\/{2}[a-z|\-]+(.*)/, '$1');

//TODO: need better regular expression
const removeHost = string => compose(removePort, removeIP, removeDomain, removeLocation)(string);

const getScripts = () => Array.from(document.getElementsByTagName('script'))
    .filter(({src} = {}) => !!src)
    .map(({src}) => removeHost(src));

const uniqueScripts = (scripts = []) => {
    const existing = getScripts();
    return scripts.filter(script => existing.indexOf(script) === -1)
};

const addScript = (src) => () => new Promise((resolve) => {
    const script = document.createElement('script');
    const {body} = document;
    assign(script, {
        src,
        async: true,
        onload() {
            resolve(src);
        }
    });
    body.appendChild(script);
});

const addScripts = task((app) => promiseSerial(uniqueScripts(app.scripts).map(src => addScript(src))).then(() => app));

const isShadow = ({createShadowRoot, attachShadow}) => !!createShadowRoot || !!attachShadow;

const attachShadow = async (container, innerHTML) => {
    const shadow = container.shadowRoot || container.attachShadow({mode: 'open'});
    return assign(shadow, {innerHTML});
};

const attachHTML = async (container, innerHTML) => assign(container, {innerHTML});

const addContent = (DOM, container, content) => task(() => (isShadow(container) ? attachShadow(container, content) : attachHTML(container, content)))
    .map(container => registerApp(DOM, container));

const setCss   = (css = []) => css.map(_ => `<link rel='stylesheet' property='stylesheet' href='${_}'>`).join('\n');
const template = (content, css) => `${css}${content}`;

const addCss = task(({content, css}) => template(content, setCss(css)));

const appLoader = (DOM) => (uri, container) => task({uri})
    .through(addHeaders)
    .through(get)
    .through(addScripts)
    .through(addCss)
    .flatMap(content => addContent(DOM, container, content))
    .unsafeRun();

export {appLoader, addCss, addScripts, addContent}