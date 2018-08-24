var utils = (function (exports) {
    'use strict';

    'use strict';

    // Subscribers are instances of Mediator Channel registrations. We generate
    // an object instance so that it can be updated later on without having to
    // unregister and re-register. Subscribers are constructed with a function
    // to be called, options object, and context.

    class Subscriber {
        constructor(fn, options, context = {}, channel = null) {
            this.fn = fn;
            this.channel = channel;
            this.context = context;
            this.options = options;
        };

        // Mediator.update on a subscriber instance can update its function,context,
        // or options object. It takes in an object and looks for fn, context, or
        // options keys.
        update(options = {}) {
            Object.assign(this, options);
            if (this.channel) {
                this.setPriority(this.priority);
            }
        };

        set options(options) {
            this.update(options);
        };

        set context(context) {
            this.setHook(context);
            this._context = context;
        };

        get context() {
            return this._context;
        };

        setHook(context) {
            const channel = this.channel;
            if (channel) {
                channel.hook(this, context);
            }
        }

        _reduceCalls() {
            // Check if the subscriber has options and if this include the calls options
            if (this.calls !== undefined) {
                // Decrease the number of calls left by one
                this.calls--;
                // Once the number of calls left reaches zero or less we need to remove the subscriber
                if (this.calls < 1) {
                    this.remove();
                }
            }
        };

        //return event remove method
        remove() {
            const channel = this.channel;
            if (channel) {
                channel.removeSubscriber(this);
            }
        };

        //Dynamic setPriority method
        setPriority(priority) {
            const channel = this.channel;
            if (channel) {
                channel.setPriority(this, priority);
            }
        };

        run(data) {
            if (!this.channel.stopped
                && !(typeof this.predicate === "function"
                && !this.predicate.apply(this.context, data))) {
                // Check if the callback should be called
                this._reduceCalls();
                //Execute function.
                this.fn.apply(this.context, data);
            }
        };

    }

    class Channel {
        constructor(namespace, parent, context, hook) {
            this.namespace = namespace || "";
            this._subscribers = [];
            this._channels = new Map();
            this._parent = parent;
            this.stopped = false;
            this.context = context;
            this.hook = hook;
        };


        // A Mediator channel holds a logout of sub-channels and subscribers to be fired
        // when Mediator.publish is called on the Mediator instance. It also contains
        // some methods to manipulate its lists of data; only setPriority and
        // StopPropagation are meant to be used. The other methods should be accessed
        // through the Mediator instance.

        addSubscriber(fn, options, context = this.context) {
            return new Subscriber(fn, options, context, this);
        };


        // The channel instance is passed as an argument to the mediator subscriber,
        // and further subscriber propagation can be called with
        // channel.StopPropagation().
        stopPropagation() {
            this.stopped = true;
        };

        // Channel.setPriority is useful in updating the order in which Subscribers
        // are called, and takes an identifier (subscriber id or named function) and
        // an array index. It will not search recursively through subchannels.

        setPriority(subscriber, priority) {
            const subscribers = this._subscribers,
                  index = subscribers.indexOf(subscriber);

            if (index !== -1) {
                subscribers.splice(subscribers.indexOf(subscriber), 1);
            }

            if (priority !== undefined && priority < this._subscribers.length) {
                subscribers.splice(priority, 0, subscriber);
            } else {
                subscribers.push(subscriber);
            }
        };

        hasChannel(channel) {
            return this._channels.has(channel);
        };

        getChannel(channel) {
            return this._channels.get(channel);
        };

        setChannel(namespace, readOnly) {
            if (!this.hasChannel(namespace) && !readOnly) {
                const channel = new Channel((this.namespace ? this.namespace + ':' : '') + namespace, this, this.context, this.hook);
                this._channels.set(namespace, channel);
                return channel;
            } else {
                return this.getChannel(namespace)
            }
        };

        returnChannel(channels, readOnly) {
            if (channels && channels.length > 0) {
                const channel = channels.shift(),
                      returnChannel = this.setChannel(channel, readOnly);
                if (returnChannel && channels.length > 0) {
                    return returnChannel.returnChannel(channels, readOnly);
                } else {
                    return returnChannel;
                }
            }
        };


        removeSubscriber(subscriber) {
            const subscribers = this._subscribers,
                  index = subscribers.indexOf(subscriber);
            // If we don't pass in an value, we're clearing all
            if (!subscriber) {
                subscribers.splice(0, subscribers.length);
            } else if (index !== -1) {
                subscribers.splice(index, 1);
            }

            if (this._subscribers.length === 0 && this._parent) {
                this._parent.removeChannel(this);
            }
        };

        removeChannel(channel) {
            if (channel === this.getChannel(channel.namespace)) {
                this._channels.delete(channel.namespace);
            }
        };

        clear() {
            this._channels.forEach(channel => channel.clear());
            this.removeSubscriber();
        };

        // This will publish arbitrary arguments to a subscriber and then to parent
        // channels.

        publish(data) {
            //slice method are cloning array, means default array can remove handlers
            this._subscribers.slice().forEach(subscriber => subscriber.run(data));

            if (this._parent) {
                this._parent.publish(data);
            }

            this.stopped = false;
        };
    }

    class Mediator {
        constructor(context = {}, hook = () => {
        }) {
            if (!(this instanceof Mediator)) {
                return new Mediator(context, hook);
            }
            this.channel = new Channel('', false, context, hook);
        }

        // A Mediator instance is the interface through which events are registered
        // and removed from publish channels.


        // Returns a channel instance based on namespace, for example
        // application:chat:message:received. If readOnly is true we
        // will refrain from creating non existing channels.

        getChannel(namespace, readOnly) {
            const namespaceHierarchy = namespace.split(':');
            if (namespaceHierarchy.length > 0) {
                return this.channel.returnChannel(namespaceHierarchy, readOnly);
            }
        };

        // Pass in a channel namespace, function to be called, options, and context
        // to call the function in to Subscribe. It will create a channel if one
        // does not exist. Options can include a predicate to determine if it
        // should be called (based on the data published to it) and a priority
        // index.

        subscribe(channelName, fn, options = {}, context) {
            if (channelName && channelName !== '') {
                const channel = this.getChannel(channelName, false);
                return channel.addSubscriber(fn, options, context);
            } else {
                throw Error('Namespace should be provided!');
            }
        };

        // Pass in a channel namespace, function to be called, options, and context
        // to call the function in to Subscribe. It will create a channel if one
        // does not exist. Options can include a predicate to determine if it
        // should be called (based on the data published to it) and a priority
        // index.

        once(channelName, fn, options = {}, context) {
            options.calls = 1;
            return this.subscribe(channelName, fn, options, context);
        };

        // Publishes arbitrary data to a given channel namespace. Channels are
        // called recursively downwards; a post to application:chat will post to
        // application:chat:receive and application:chat:derp:test:beta:bananas.
        // Called using Mediator.publish("application:chat", [ args ]);

        publish(channelName, ...args) {
            if (channelName && channelName !== '') {
                const channel = this.getChannel(channelName, true);
                if (channel && channel.namespace === channelName) {
                    args.push(channel);
                    channel.publish(args);
                }
            }
        };

        clear() {
            this.channel.clear();
        };
    }

    // Alias some common names for easy interop
    Mediator.prototype.on = Mediator.prototype.subscribe;
    Mediator.prototype.trigger = Mediator.prototype.publish;

    // Finally, expose it all.

    Mediator.version = "0.9.9";

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

    const {style} = document.createElement('fakeelement');

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
    const setModifier = (el, modifier) => [getClass(el), modifier.replace(/^_/, '')].join('_');

    const addModifier = (el, modifier) => addClass(el, setModifier(el, modifier));
    const removeModifier = (el, modifier) => removeClass(el, setModifier(el, modifier));
    const hasModifier = (el, modifier) => hasClass(el, setModifier(el, modifier));

    function __async(g){return new Promise(function(s,j){function c(a,x){try{var r=g[x?"throw":"next"](a);}catch(e){j(e);return}r.done?s(r.value):Promise.resolve(r.value).then(c,d);}function d(e){c(e,1);}c();})}

    const addTemplate = (container, template) => __async(function*(){
        container.innerHTML = template;
        return container;
    }());

    class Container {
        constructor(el) {
            if (!el) {
                throw ('Element not defined!')
            }
            this.el = el;
            this._handlers = new Set();
        };

        applyToChildren(selector, method = _ => _) {
            return Array.from(this.el.querySelectorAll(selector)).map(el => method(el));
        };

        dataset(name, value) {
            const {el} = this;
            if (value !== undefined) {
                el.dataset[name] = value;
            }
            return el.dataset[name];
        }

        addMethod(method) {
            return method(this.el);
        };

        on(ev, cb) {
            const evt = on(this.el, ev, cb, this);
            this._handlers.add(evt);
            return evt;
        };

        addTemplate(template) {
            return addTemplate(this.el, template).then(() => this);
        };

        remove() {
            const parent = this.el.parentNode;
            this._handlers.forEach(hd => hd.remove());
            if (parent) {
                parent.removeChild(this.el);
            }
        }
    }

    const container = (selector) => new Container(qs(selector));

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
                   const container$$1 = new Container(el);
                   containers.add(container$$1);
                   return container$$1;
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
                return Array.from(containers).map((container$$1) => container$$1.remove());
            }
        };
    };

    const test = (el, map) => !map.has(el);

    const removeNodes = node => node.hasChildNodes() ? Array.from(node.childNodes).map(childNode => node.removeChild(childNode)) : [];

    const _scope = Symbol('_scope');
    const _callbacks = Symbol('_callbacks');
    const _evtBus = Symbol('_evtBus');

    class ScopeRegistry {
        constructor(scope) {
            this[_scope] = scope;
            this[_callbacks] = new Map();
            this[_evtBus] = new Mediator();
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
            removeNodes(this[_scope]);
        }
    }

    const scopeRegistry = (...args) => new ScopeRegistry(...args);

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

        register(container = body) {return __async(function*(){
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
        }.call(this))}

        remove(container = body) {
            return this[_getScope](container).remove();
        }
    }

    const registry = (...args) => new Registry(...args);

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

    const curry = (fn, ...args) => (fn.length <= args.length) ? fn(...args) : (...more) => curry(fn, ...args, ...more);

    const {isArray} = Array;
    const {assign: assign$1} = Object;


    const prop = curry((key, obj) => (obj || {})[key]);
    const assoc = curry((key, val, obj) => assign$1(isArray(obj) ? [] : {}, obj || {}, {[key]: val}));

    const lens = (get, set) => ({get, set});

    const view = curry((lens, obj) => lens.get(obj));
    const set = curry((lens, val, obj) => lens.set(val, obj));
    const over = curry((lens, fn, obj) => set(lens, fn(view(lens, obj)), obj));
    const overAsync = curry((lens, fn, obj) =>__async(function*(){ return set(lens, yield fn(view(lens, obj)), obj)}()));
    const setOver = curry((setterLens, getterLens, fn, obj) => set(setterLens, fn(view(getterLens, obj)), obj));
    const setOverAsync = curry((setterLens, getterLens, fn, obj) =>__async(function*(){ return set(setterLens, yield fn(view(getterLens, obj)), obj)}()));

    const lensProp = key => lens(prop(key), assoc(key));
    const lensPath = (head, ...tail) => ({
        get(obj = {}) {
            return tail.length === 0 ? view(lensProp(head), obj) : view(lensPath(...tail), obj[head]);
        },
        set(val, obj = {}) {
            return tail.length === 0 ? set(lensProp(head), val, obj) : assoc(head, set(lensPath(...tail), val, obj[head]), obj);
        }
    });

    const evtBus = new Mediator();

    exports.DOM = DOM;
    exports.Mediator = Mediator;
    exports.evtBus = evtBus;

    return exports;
}({}));
