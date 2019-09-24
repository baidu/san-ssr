import { Emitter } from './emitter'
import { ExpressionEmitter } from './expression-emitter'
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

    stringBuffer = ''

    addRaw (code) {
        this.push({
            type: 'RAW',
            code: code
        })
    }

    /**
    * 添加被拼接为html的原始代码
    *
    * @param {string} code 原始代码
    */
    joinRaw (code) {
        this.push({
            type: 'JOIN_RAW',
            code: code
        })
    }

    /**
    * 添加renderer方法的起始源码
    */
    addRendererStart (funcName) {
        this.addRaw(`function ${funcName}($data, $noDataOutput) {`)
    }

    /**
    * 添加renderer方法的结束源码
    */
    addRendererEnd () {
        this.addRaw('}')
    }

    /**
    * 添加被拼接为html的静态字符串
    *
    * @param {string} str 被拼接的字符串
    */
    joinString (str) {
        this.push({
            str: str,
            type: 'JOIN_STRING'
        })
    }

    /**
    * 添加被拼接为html的数据访问
    *
    * @param {Object?} accessor 数据访问表达式对象
    */
    joinDataStringify () {
        this.push({
            type: 'JOIN_DATA_STRINGIFY'
        })
    }

    /**
    * 添加被拼接为html的表达式
    *
    * @param {Object} expr 表达式对象
    */
    joinExpr (expr) {
        this.push({
            expr: expr,
            type: 'JOIN_EXPR'
        })
    }

    flush () {
        if (this.stringBuffer) {
            this.writeLine('$html .= ' + ExpressionEmitter.stringLiteralize(this.stringBuffer) + ';')
        }

        this.stringBuffer = ''
    }

    push (seg) {
        if (seg.type === 'JOIN_STRING') {
            this.stringBuffer += seg.str
            return
        }
        this.flush()

        switch (seg.type) {
        case 'JOIN_DATA_STRINGIFY':
            this.writeLine('$html .= "<!--s-data:" . json_encode(' +
            ExpressionEmitter.dataAccess() + ', JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "-->";\n')
            break

        case 'JOIN_EXPR':
            this.writeLine('$html .= ' + ExpressionEmitter.expr(seg.expr) + ';')
            break

        case 'JOIN_RAW':
            this.writeLine('$html .= ' + seg.code + ';')
            break

        case 'RAW':
            this.writeLine(seg.code)
            break
        }
    }
}
