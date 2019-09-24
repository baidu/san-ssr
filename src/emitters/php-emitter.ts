import { Emitter } from './emitter'
import { ExpressionEmitter } from './expression-emitter'
import { emitRuntimeInPHP } from './runtime'

export class PHPEmitter extends Emitter {
    stringBuffer = ''

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

    addRaw (code) {
        this.flush()
        this.writeLine(code)
    }

    /**
    * 添加被拼接为html的原始代码
    *
    * @param {string} code 原始代码
    */
    joinRaw (code) {
        this.flush()
        this.writeLine('$html .= ' + code + ';')
    }

    /**
    * 添加被拼接为html的静态字符串
    *
    * @param {string} str 被拼接的字符串
    */
    joinString (str) {
        this.stringBuffer += str
    }

    /**
    * 添加被拼接为html的数据访问
    *
    * @param {Object?} accessor 数据访问表达式对象
    */
    joinDataStringify () {
        this.flush()
        this.writeLine('$html .= "<!--s-data:" . json_encode(' +
        ExpressionEmitter.dataAccess() + ', JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "-->";\n')
    }

    /**
    * 添加被拼接为html的表达式
    *
    * @param {Object} expr 表达式对象
    */
    joinExpr (expr) {
        this.flush()
        this.writeLine('$html .= ' + ExpressionEmitter.expr(expr) + ';')
    }

    flush () {
        if (this.stringBuffer) {
            this.writeLine('$html .= ' + ExpressionEmitter.stringLiteralize(this.stringBuffer) + ';')
        }

        this.stringBuffer = ''
    }
}
