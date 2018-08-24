const {keys, assign} = Object;
const removeDuplicates = array => array.reduce((l, r) => (l.indexOf(r) < 0) ? [...l, r] : l, []);
const isObject = (obj) => (!!obj) && (obj.constructor === Object);

const applyValue = (left, right) => {
    if (Array.isArray(right) && Array.isArray(left)) {
        return removeDuplicates([...right, ...left]);
    } else if (isObject(left) && isObject(right)) {
        return assign({}, left, right);
    } else {
        return right;
    }
};

const deepApply = (init, keys = [], value) => {
    const [head, ...tail] = keys;
    return assign({}, init, {[head]: tail.length === 0 ? applyValue(init[head], value) : deepApply(init[head] || {}, tail, value)})
};

const merge = (src = {}, target = {}) => keys(target).reduce((initial, current) => deepApply(initial, current.split('.'), target[current]), src);

export default merge;