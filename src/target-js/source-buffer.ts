import { compileExprSource } from './compilers/expr-compiler'

// TODO make it a emitter subtype

/**
* 编译源码的中间buffer类
*/
export class CompileSourceBuffer {
    segs: any[]
    constructor () {
        this.segs = []
    }
    /**
    * 添加原始代码，将原封不动输出
    */
    addRaw (code: string) {
        this.segs.push({
            type: 'RAW',
            code: code
        })
    }

    /**
    * 添加被拼接为html的原始代码
    */
    joinRaw (code: string) {
        this.segs.push({
            type: 'JOIN_RAW',
            code: code
        })
    }

    /**
    * 添加被拼接为html的静态字符串
    */
    joinString (str: string) {
        this.segs.push({
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
        this.segs.push({
            type: 'JOIN_DATA_STRINGIFY'
        })
    }

    /**
    * 添加被拼接为html的表达式
    *
    * @param {Object} expr 表达式对象
    */
    joinExpr (expr) {
        this.segs.push({
            expr: expr,
            type: 'JOIN_EXPR'
        })
    }

    /**
    * 生成编译后代码
    *
    * @return {string}
    */
    toCode () {
        const code = []
        let temp = ''

        function genStrLiteral () {
            if (temp) {
                code.push('html += ' + compileExprSource.stringLiteralize(temp) + ';')
            }

            temp = ''
        }

        for (const seg of this.segs) {
            if (seg.type === 'JOIN_STRING') {
                temp += seg.str
                continue
            }

            genStrLiteral()
            switch (seg.type) {
            case 'JOIN_DATA_STRINGIFY':
                code.push('html += "<!--s-data:" + JSON.stringify(' +
                compileExprSource.dataAccess() + ') + "-->";')
                break

            case 'JOIN_EXPR':
                code.push('html += ' + compileExprSource.expr(seg.expr) + ';')
                break

            case 'JOIN_RAW':
                code.push('html += ' + seg.code + ';')
                break

            case 'RAW':
                code.push(seg.code)
                break
            }
        }

        genStrLiteral()

        return code.join('\n')
    }
}
