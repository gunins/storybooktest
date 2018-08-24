import {io} from '../src/client/dom/io';
import {action} from '@storybook/addon-actions';
import {addContent, addCss, addScripts} from '../src/client/apploader';
import {qs} from '../src/client/dom/selectors';

export default widget => cb => {
    const div       = document.createElement('div');
    div.innerHTML   = `<div class='root'></div>`;
    const container = qs('div', div);
    const observer  = io(div, {threshold: [0, 0.25, 0.5, 0.75, 1]});
    observer.observe(container, (e) => {
        action('Element Attached to DOM')(e);
        widget
            .through(addScripts)
            .through(addCss)
            .flatMap(content => {
                const {DOM} = window.utils;
                return addContent(DOM, container, content)
            })
            .unsafeRun().then(_ => {
            action('Widget Initialised')(_);
            const {DOM}         = window.utils;
            const {appRegistry} = DOM;
            appRegistry.register(div);
            cb(_)
        });
    });
    return div;
}