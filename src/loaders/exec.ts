import { spawn, spawnSync } from 'child_process'

export function exec (bin, args) {
    const proc = spawn(bin, args)

    return new Promise((resolve, reject) => {
        proc.on('error', reject)

        let outStr = ''
        proc.stderr.on('data', chunk => (outStr += chunk))

        let errStr = ''
        proc.stderr.on('data', chunk => (errStr += chunk))

        proc.on('close', (code) => {
            if (code) {
                const err = new Error('STDERR:\n' + errStr + '\nSTDOUT:\n' + outStr + '\n')
                reject(err)
            } else {
                resolve(outStr)
            }
        })
    })
}

export function execCommandSync (bin, args) {
    const proc = spawnSync(bin, args)
    if (proc.error || proc.stderr.length) {
        throw proc.error || new Error(proc.stderr.toString() + '\nSTDOUT:\n' + proc.stdout.toString() + '\n')
    }
    return proc.stdout.toString()
}
