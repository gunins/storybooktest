import {lensPath, view} from './lenses';
import {uniqueProperties} from './unique';

const {assign} = Object;

const value = (obj, key) => view(lensPath(key))(obj);

const compare = (left = {}, right = {}) => uniqueProperties(left, right).reduce((bool, key) => {
    const l = left[key];
    const r = right[key];
    return bool ? typeof l === 'object' && typeof r === 'object' ? compare(l, r) : l === r : bool
}, true);

const diff = (left = {}, right = {}, side = 'right') => uniqueProperties(left, right)
    .filter(key => !compare(value(left, key), value(right, key)))
    .reduce((initial, key) => {
        const obj = side === 'right' ? value(right, key) : value(left, key);
        return obj ? assign(initial, {[key]: obj}) : initial
    }, {});

const diffLeft = (left = {}, right = {}) => diff(left, right, 'left');
const diffRight = (left = {}, right = {}) => diff(left, right, 'right');

export {diffLeft, diffRight, compare};