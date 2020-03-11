import ToJSCompiler from '../target-js/index'

export function loadCompilerClassByTarget (target: string) {
    const name = `san-ssr-target-${target}`
    if (name === 'san-ssr-target-js') return ToJSCompiler

    const path = resolve(name)
    if (!path) {
        throw new Error(`failed to load "san-ssr-target-${target}"`)
    }

    const plugin = require(path)
    return plugin.default || plugin
}

export function resolve (moduleName: string) {
    try {
        return require.resolve(moduleName)
    } catch (e) {
        return null
    }
}
