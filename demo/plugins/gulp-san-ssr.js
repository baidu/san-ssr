const through2 = require('through2')
const PluginError = require('plugin-error')
const { extname } = require('path')
const { ToJSCompiler, ToPHPCompiler } = require('san-ssr')

const PLUGIN_NAME = 'gulp-san-ssr'

module.exports = function ({ target = 'js', ssrOptions } = {}) {
    return through2.obj(function (file, _, cb) {
        if (file.isNull()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'File: "' + file.relative + '" without content. You have to read it with gulp.src(..)'))
            return
        }

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streaming not supported'))
            cb()
            return
        }

        if (file.isBuffer()) {
            const targetCode = compile(file, target, ssrOptions)
            file.contents = Buffer.from(targetCode)
            const path = file.path
            const ext = extname(path)
            file.path = path.substr(0, path.length - ext.length) + '.' + target
        }

        cb(null, file)
    })
}

function compile (file, target, ssrOptions) {
    const Compiler = target === 'php' ? ToPHPCompiler : ToJSCompiler
    const compiler = new Compiler(ssrOptions)
    const targetCode = compiler.compile(file.path)
    return targetCode
}
