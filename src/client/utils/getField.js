const getField = (field) => (data) => {
    const resp = data[field];
    if (!resp) {
        throw new TypeError(`Object field "${field}" Must be defined`)
    }
    return resp;
}

export default getField;