import { spawnSync } from 'child_process'

export function exec (bin, args) {
    const proc = spawnSync(bin, args)
    if (proc.error || proc.stderr.length) {
        throw proc.error || new Error(proc.stderr.toString() + '\nSTDOUT:\n' + proc.stdout.toString() + '\n')
    }
    return proc.stdout.toString()
}
