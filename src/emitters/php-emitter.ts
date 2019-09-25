import { Emitter } from './emitter'
import { ExpressionEmitter } from './expression-emitter'
import { emitRuntimeInPHP } from './runtime'

export class PHPEmitter extends Emitter {
    buffer = ''

    public write (str) {
        this.clearStringLiteralBuffer()
        return this.defaultWrite(str)
    }

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

    public bufferHTMLLiteral (str: string) {
        this.buffer += str
    }

    public writeHTML (code: string) {
        this.writeLine(`$html .= ${code};`)
    }

    public writeDataComment () {
        this.writeHTML('"<!--s-data:" . json_encode(' + ExpressionEmitter.dataAccess() + ', JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "-->";')
    }

    public clearStringLiteralBuffer () {
        if (this.buffer === '') return
        const buffer = this.buffer
        this.buffer = ''
        this.writeHTML(ExpressionEmitter.stringLiteralize(buffer))
    }

    public beginIf (expr) {
        this.writeLine(`if (${expr}) {`)
        this.indent()
    }

    public endIf () {
        this.unindent()
        this.writeLine(`}`)
    }
}
