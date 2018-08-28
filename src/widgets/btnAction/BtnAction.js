import {task} from 'functional/core/Task';
import template from './_btnAction';
import {set, view, lensPath} from '../../client/utils/lenses';
import {compose} from '../../client/utils/curry';

// const respLens    = view(lensPath('resp'));
const cssLens     = set(lensPath('css'));
const scriptsLens = set(lensPath('scripts'));
const applyLens = lenses=>_=>lenses.map(lens=>view(lens)(_));
const widget = (btnLens, ...lenses) => task((_ = {}) => compose(
    set(btnLens, template(...applyLens(lenses)(_))),
    cssLens(['/widgets/btnAction/style.css']),
    scriptsLens(['/main.js', '/widgets/btnAction/main.js',])
)(_));

export default widget;