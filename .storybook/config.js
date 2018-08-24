
import { configure } from '@storybook/html';
import { setOptions } from '@storybook/addon-options';
setOptions({
               showSearchBox: false,
               showStoriesPanel: true

           });

// automatically import all files ending in *.stories.js
const req = require.context('../stories', true, /.stories.js$/);
function loadStories() {
    req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);