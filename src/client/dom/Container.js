import {qs} from "./selectors";
import {on} from "./eventHandler";

const addTemplate = async (container, template) => {
    container.innerHTML = template;
    return container;
};

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

export {Container, container}
