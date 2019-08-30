const { spawnSync } = require('child_process')
const { resolve } = require('path')

function render (caseName, target) {
    const bin = resolve(__dirname, `../bin/render.${target}`)
    const proc = spawnSync(bin, [caseName])
    if (proc.error || proc.stderr.length) {
        throw proc.error || new Error(proc.stderr.toString() + '\nSTDOUT:\n' + proc.stdout.toString() + '\n')
    }
    return proc.stdout.toString()
}

exports.render = render
