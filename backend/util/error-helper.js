module.exports.createError = (message, status) => {
    const err = new Error(message)
    err.status = status || 500
    err.isTrusted = true
    return err;
}
