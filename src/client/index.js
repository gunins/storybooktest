import {Mediator} from './Mediator';
import {DOM} from './DOM';

const evtBus = new Mediator();
export {DOM, Mediator, evtBus};