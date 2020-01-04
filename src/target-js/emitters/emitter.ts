import { Emitter } from '../../utils/emitter'

export class JSEmitter extends Emitter {
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

    public writeBlock (expr: string, cb: Function = () => null) {
        this.writeLine(`${expr ? expr + ' ' : ''}{`)
        this.indent()
        cb()
        this.unindent()
        this.writeLine(`}`)
    }
}
