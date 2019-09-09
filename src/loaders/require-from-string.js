function requireFromString (str) {
    // eslint-disable-next-line
    const fn = new Function('module', 'exports', 'require', str)
    const module = { exports: {} }
    fn(module, module.exports, require)
    return module.exports
}

exports.requireFromString = requireFromString
