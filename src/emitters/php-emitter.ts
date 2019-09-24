import { Emitter } from './emitter'
import { emitRuntimeInPHP } from './runtime'

export class PHPEmitter extends Emitter {
    public writeRuntime () {
        emitRuntimeInPHP(this)
    }

    public beginNamespace (ns: string = '') {
        const code = ns === ''
            ? 'namespace {'
            : `namespace ${ns} {`

        this.writeLine(code)
        this.indent()
    }

    public endNamespace () {
        this.unindent()
        this.writeLine(`}`)
    }
}
