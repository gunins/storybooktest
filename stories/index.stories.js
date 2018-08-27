import btnAction from '../src/widgets/btnAction/BtnAction';
import {task} from 'functional/core/Task';

import {storiesOf} from '@storybook/html';
import {action} from '@storybook/addon-actions';
import { withNotes } from '@storybook/addon-notes';


import {lensPath, set} from '../src/client/utils/lenses';

import storyAdder from './storyAdder';

const widgetLens = lensPath('content');
const btnTextLens = lensPath('btnText');

const fancyButton = task(_ => set(btnTextLens, 'This Is Fancy Button')(_)).through(btnAction(widgetLens, btnTextLens));

const testPattern = ({evtBus}) => {
    evtBus.subscribe('mdw-btnAction-trigger', _ => action('btnClick')(_));
};


storiesOf('Demo', module)
    .add('heading', () => '<h1>Hello World</h1>')
    .add('button', withNotes('A very simple component')(() => storyAdder(fancyButton)(_ => testPattern(_))));
