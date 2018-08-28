import btnAction from '../src/widgets/btnAction/BtnAction';
import {task} from 'functional/core/Task';

import {storiesOf} from '@storybook/html';
import {action} from '@storybook/addon-actions';
import {withNotes} from '@storybook/addon-notes';
import {withKnobs, text, boolean, number} from '@storybook/addon-knobs';
import {compose} from '../src/client/utils/curry';

import {lensPath, set} from '../src/client/utils/lenses';

import storyAdder from './storyAdder';

const widgetLens = lensPath('content');
const btnTextLens = lensPath('btn', 'text');
const btnTitleLens = lensPath('btn', 'title');
const btnGroupLens = lensPath('btn', 'group');
const btnValueLens = lensPath('btn', 'value');


const testPattern = ({evtBus}) => {
    evtBus.subscribe('mdw-btnAction-trigger', _ => action('btnClick')(_));
};

const fancyButton = task(_ => compose(
    set(btnTextLens, text('Button Text', 'Big Fancy Text')),
    set(btnTitleLens, text('Button Title', 'Big Fancy Title')),
    set(btnGroupLens, text('Button Group', 'Big Fancy Group')),
    set(btnValueLens, text('Button Value', 'Big Fancy Value'))
)(_)).through(btnAction(widgetLens, btnTextLens, btnTextLens, btnGroupLens, btnValueLens));


storiesOf('Demo', module).addDecorator(withKnobs)
    .add('heading', () => '<h1>Hello World</h1>')
    .add('button', withNotes('A very simple component')(() => storyAdder(fancyButton)(_ => testPattern(_))));
