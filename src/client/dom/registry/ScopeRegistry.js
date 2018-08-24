import {qs, qsAll} from '../selectors';
import {Container} from '../Container';
import {Mediator} from '../../Mediator';

const setClass = (selector, name) => name && name.indexOf('.') === 0 ? name : name ? selector + '-' + name : name;

const registerCallback = (root, cb, {evtBus, remove, selector}, i) => {
    const containers = new Set();
    const destroyHandlers = new Set();
    cb({
        root,
        evtBus,
        container: (elementName) => {
            const longClass = setClass(selector, elementName);
            const el = longClass ? qs(longClass, root) : root;
            const container = new Container(el);
            containers.add(container);
            return container;
        },
        onDestroy(handler) {
            destroyHandlers.add(handler);
        },
        destroy() {
            destroyHandlers.forEach(_ => _());
            remove();
            destroyHandlers.clear();
        }
    }, i);
    return {
        root,
        remove() {
            return Array.from(containers).map((container) => container.remove());
        }
    };
};

const test = (el, map) => !map.has(el);

const removeNodes = node => node.hasChildNodes() ? Array.from(node.childNodes).map(childNode => node.removeChild(childNode)) : []

const _scope = Symbol('_scope');
const _callbacks = Symbol('_callbacks');
const _evtBus = Symbol('_evtBus');

class ScopeRegistry {
    constructor(scope) {
        this[_scope] = scope;
        this[_callbacks] = new Map();
        this[_evtBus] = new Mediator()
    }

    getEvtBus() {
        return this[_evtBus];
    }

    update(selector, cb) {
        const evtBus = this[_evtBus];
        const callbacks = this[_callbacks];
        const scope = this[_scope];
        const remove = this.remove.bind(this);
        return qsAll(selector, scope)
            .filter((el) => test(el, callbacks))
            .map((el, i) => registerCallback(el, cb, {evtBus, remove, selector}, i))
            .map(({root, remove}) => callbacks.set(root, remove));
    }

    remove() {
        const callbacks = this[_callbacks];
        Array.from(callbacks).map(([el, remove]) => {
            remove();
            el.remove();
        });
        callbacks.clear();
        this[_evtBus].clear();
        removeNodes(this[_scope])
    }
}

const scopeRegistry = (...args) => new ScopeRegistry(...args);

export {scopeRegistry, ScopeRegistry}