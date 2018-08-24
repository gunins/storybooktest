import {qs, qsAll, element, select, selectAll} from './dom/selectors';
import {on, once} from './dom/eventHandler';
import {
    hasClass,
    addClass,
    removeClass,
    toggleClass,
    addModifier,
    hasModifier,
    removeModifier
} from './dom/classManipulator';
import {registry} from './dom/registry/Registry';
import {Container, container} from "./dom/Container";

const appRegistry = registry();

const rootElement = (selector, cb) => {
    return appRegistry.add(selector, cb)
};

const DOM = {
    qs,
    qsAll,
    element,
    addClass,
    removeClass,
    toggleClass,
    hasClass,
    addModifier,
    hasModifier,
    removeModifier,
    on,
    once,
    Container,
    select,
    selectAll,
    container,
    rootElement,
    appRegistry
};

export {DOM};
