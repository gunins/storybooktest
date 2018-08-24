import {scopeRegistry} from './ScopeRegistry';

const {body} = document;

const _handlers = Symbol('_handlers');
const _scopes = Symbol('_scopes');
const _remove = Symbol('_remove');
const _setScope = Symbol('_setScope');
const _getScope = Symbol('_getScope');
const _test = Symbol('_test');

class Registry {
    constructor() {
        this[_handlers] = new Map();
        this[_scopes] = new Map();
    }

    [_remove](key) {
        this[_handlers].delete(key);
    }

    [_test](key) {
        return this[_handlers].has(key);
    }

    [_setScope](container) {
        const scopes = this[_scopes];
        scopes.set(container, scopeRegistry(container));
        return scopes.get(container);
    }

    [_getScope](container) {
        const scopes = this[_scopes];
        return scopes.has(container) ? scopes.get(container) : this[_setScope](container)
    }

    add(key, value) {
        if (!this[_test](key)) {
            this[_handlers].set(key, value);
        }
        const remove = this[_remove].bind(this);
        return {
            remove() {
                remove(key);
            }
        }
    }

    async register(container = body) {
        const scope = this[_getScope](container);
        const evtBus = scope.getEvtBus();
        Array.from(this[_handlers]).map(([selector, cb]) => scope.update(selector, cb));
        return {
            container,
            evtBus,
            remove() {
                scope.remove();
            }
        }
    }

    remove(container = body) {
        return this[_getScope](container).remove();
    }
}

const registry = (...args) => new Registry(...args);

export {registry, Registry}