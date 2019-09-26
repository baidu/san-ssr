import { Emitter } from './emitter'
import { emitRuntimeInJS } from './runtime'

export class JSEmitter extends Emitter {
    public writeRuntime () {
        emitRuntimeInJS(this)
    }

    public write (str: string) {
        return this.defaultWrite(str)
    }

    public writeFunction (name = '', args = [], body: Function = () => null) {
        const nameStr = name ? `${name} ` : ''
        const argsStr = args.join(', ')
        this.feedLine(`function ${nameStr}(${argsStr}) {`)
        this.indent()
        body()
        this.unindent()
        this.nextLine('}')
    }

    public writeAnonymousFunction (args = [], body: Function = () => null) {
        return this.writeFunction('', args, body)
    }
}
