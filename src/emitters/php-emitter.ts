import { Emitter } from './emitter'
import { ExpressionEmitter } from './expression-emitter'

export class PHPEmitter extends Emitter {
    buffer: string = ''

    constructor (emitHeader = false) {
        super()
        if (emitHeader) this.writeLine('<?php')
    }

    public write (str) {
        this.clearStringLiteralBuffer()
        return this.defaultWrite(str)
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

    public writeSwitch (expr: string, body: Function) {
        this.writeLine(`switch (${expr}) {`)
        this.indent()
        body()
        this.unindent()
        this.writeLine('}')
    }

    public writeCase (expr: string, body: Function = () => null) {
        this.writeLine(`case ${expr}:`)
        this.indent()
        body()
        this.unindent()
    }

    public writeBreak () {
        this.writeLine('break;')
    }

    public writeDefault (body: Function = () => null) {
        this.writeLine('default:')
        this.indent()
        body()
        this.unindent()
    }

    public writeFunction (name = '', args = [], use = [], body: Function = () => null) {
        const nameStr = name ? `${name} ` : ''
        const argsStr = args.join(', ')
        const useStr = use.length ? `use (${use.join(', ')}) ` : ''
        this.feedLine(`function ${nameStr}(${argsStr}) ${useStr}{`)
        this.indent()
        body()
        this.unindent()
        this.nextLine('}')
    }
    public writeAnonymousFunction (args = [], use = [], body: Function = () => null) {
        this.writeFunction('', args, use, body)
    }
    public writeFunctionCall (name: string, args: string[]) {
        this.write(`${name}(${args.join(', ')})`)
    }

    public writeIf (expr: string, cb: Function) {
        this.beginIf(expr)
        cb()
        this.endIf()
    }
    public beginIf (expr: string) {
        this.beginBlock(`if (${expr})`)
    }
    public beginElseIf (expr: string) {
        this.beginBlock(`else if (${expr})`)
    }
    public beginElse () {
        this.beginBlock(`else`)
    }
    public endIf () {
        this.endBlock()
    }

    public writeForeach (expr: string, cb: Function) {
        this.beginForeach(expr)
        cb()
        this.endForeach()
    }
    public beginForeach (expr: string) {
        this.beginBlock(`foreach (${expr})`)
    }
    public endForeach () {
        this.endBlock()
    }
    public writeContinue () {
        this.writeLine('continue;')
    }

    public writeBlock (expr: string, cb: Function) {
        this.beginBlock(expr)
        cb()
        this.endBlock()
    }
    public beginBlock (expr: string) {
        this.writeLine(`${expr} {`)
        this.indent()
    }
    public endBlock () {
        this.unindent()
        this.writeLine(`}`)
    }
}
