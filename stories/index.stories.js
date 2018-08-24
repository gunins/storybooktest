import btnAction from '../src/widgets/btnAction/BtnAction'

import {storiesOf} from '@storybook/html';
import {action} from '@storybook/addon-actions';

import {lensPath} from '../src/client/utils/lenses';

import storyAdder from './storyAdder';

const widgetLens = lensPath('content');

storiesOf('Demo', module)
    .add('heading', () => '<h1>Hello World</h1>')
    .add('button', () => storyAdder(btnAction(widgetLens), ({evtBus}) => {
        evtBus.subscribe('mdw-btnAction-trigger', _ => action('btnClick')(_));
    }));
