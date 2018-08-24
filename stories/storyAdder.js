import {io} from '../src/client/dom/io';
import {action} from '@storybook/addon-actions';
import {addContent, addCss, addScripts} from '../src/client/apploader';
import {lensPath, view} from '../src/client/utils/lenses';

const domLens = view(lensPath('utils', 'DOM'));
const appRegistryLens = view(lensPath('utils', 'DOM', 'appRegistry'));

const element = (tag = 'div') => document.createElement(tag);

const onDomAttached = ({root, container}, cb) => io(root, {
    threshold: [
        0, 0.25, 0.5, 0.75, 1
    ]
}).observe(container, _ => cb(_));

const createContainer = (tag = 'div') => {
    const root = element();
    const container = element(tag);
    root.appendChild(container);
    return {
        root,
        container
    };
};

const setContainer = (widget, e, container) => cb => {
    action('Element Attached to DOM')(e);
    widget
        .through(addScripts)
        .through(addCss)
        .flatMap(content => addContent(domLens(window), container, content))
        .unsafeRun().then(_ => {
        action('Widget Initialised')(_);
        appRegistryLens(window).register(container);
        cb(_)
    });
};

export default widget => cb => {
    const {root, container} = createContainer();

    onDomAttached({
        root,
        container
    }, e => setContainer(widget, e, container)(cb));

    return root;
}