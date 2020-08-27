import { Emitter } from '../utils/emitter'
import { dataAccess } from './compilers/expr-compiler'
import { stringifier } from './compilers/stringifier'

export class JSEmitter extends Emitter {
    buffer: string = ''

    public fullText () {
        this.clearStringLiteralBuffer()
        return super.fullText()
    }

    public write (str: string) {
        this.clearStringLiteralBuffer()

        return this.defaultWrite(str)
    }

    public writeHTMLExpression (code: string) {
        this.writeLine(`html += ${code};`)
    }

    public writeDataComment () {
        this.writeHTMLExpression(`"<!--s-data:" + JSON.stringify(${dataAccess(undefined, 'none', '_.getRootCtx(ctx)')}) + "-->"`)
    }

    public writeHTMLLiteral (str: string) {
        this.buffer += str
    }

    public clearStringLiteralBuffer () {
        if (this.buffer === '') return
        const buffer = this.buffer
        this.buffer = ''
        this.writeHTMLExpression(stringifier.str(buffer))
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

    public writeFunction (name = '', args: string[] = [], body: Function = () => null) {
        const nameStr = name ? `${name} ` : ''
        const argsStr = args.join(', ')
        this.feedLine(`function ${nameStr}(${argsStr}) {`)
        this.indent()
        body()
        this.unindent()
        this.nextLine('}')
    }

    public writeFunctionCall (name: string, args: string[]) {
        this.write(`${name}(${args.join(', ')})`)
    }

    public writeAnonymousFunction (args: string[] = [], body: Function = () => null) {
        return this.writeFunction('', args, body)
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
        this.beginBlock('else')
    }

    public endIf () {
        this.endBlock()
    }

    public writeFor (expr: string, cb: Function) {
        this.beginFor(expr)
        cb()
        this.endFor()
    }

    public beginFor (expr: string) {
        this.beginBlock(`for (${expr})`)
    }

    public endFor () {
        this.endBlock()
    }

    public writeContinue () {
        this.writeLine('continue;')
    }

    public writeBlock (expr: string, cb: Function = () => null, nl = true) {
        this.beginBlock(expr, nl)
        cb()
        this.endBlock(nl)
    }

    public beginBlock (expr: string, nl = true) {
        const text = `${expr ? expr + ' ' : ''}{`
        nl ? this.writeLine(text) : this.feedLine(text)
        this.indent()
    }

    public endBlock (nl = true) {
        this.clearStringLiteralBuffer()
        this.unindent()
        nl ? this.writeLine('}') : this.nextLine('}')
    }
}
