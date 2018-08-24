const option = (...methods) => ({
    or(bool, left) {
        return option(...methods, {bool, left})
    },
    finally(right) {
        const {left} = methods.find(({bool}) => bool) || {};
        return left ? left() : right();
    }
});

const findAsync = ([head, ...tail]) => {
    const {bool, left} = head || {};
    return bool
        ? bool()
            .then(() => left)
            .catch(() => findAsync(tail))
        : Promise.reject();
};

const optionAsync = (...methods) => ({
    or(bool, left) {
        return optionAsync(...methods, {bool, left})
    },
    finally(right) {
        return findAsync(methods)
            .then(left => left())
            .catch(() => right())
    }
});

const promiseOption = (cond) => cond ? Promise.resolve(cond) : Promise.reject(cond);


export {option, optionAsync, promiseOption};