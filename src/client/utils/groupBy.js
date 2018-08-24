import {curry} from './curry';
import {uniqueArray} from '../db/keywordUtils/arrayUtils';

const {assign, keys} = Object;

const uniqueKeys = (...args) => args.reduce((_, obj = {}) => _.concat(keys(obj)).filter(uniqueArray), []);

const isIn = (fields = [], array = [], source = {}) => array.find((target = {}) => fields.filter(key => source[key] === target[key]).length === fields.length);

const convert = (fields, source = {}, target = {}) => uniqueKeys(source, target)
    .reduce((_, field) => assign(_, {
        [field]: fields.indexOf(field) !== -1 ? source[field] : ((target[field] ? target[field] : [])).concat([source[field]])
    }), {});

const combine = (fields = [], source, target, array) => array.filter(_ => _ !== target).concat(convert(fields, source, target));

const groupBy = curry((fields, array) => array.reduce((_, source) => combine(fields, source, isIn(fields, _, source), _), []));

export {groupBy};