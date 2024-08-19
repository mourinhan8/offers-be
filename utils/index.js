const cleanUndefinedFields = (obj) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined)
    );
};

module.exports = {
    cleanUndefinedFields
}