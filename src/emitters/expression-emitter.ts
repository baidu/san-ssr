import { each } from '../utils/underscore'

/**
* 编译源码的 helper 方法集合对象
*/
export const ExpressionEmitter = {

    /**
     * 字符串字面化
     *
     * @param {string} source 需要字面化的字符串
     * @return {string} 字符串字面化结果
     */
    stringLiteralize: function (source) {
        return '"' +
        source
            .replace(/\x5C/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\x0A/g, '\\n')    // eslint-disable-line
            .replace(/\x09/g, '\\t')    // eslint-disable-line
            .replace(/\x0D/g, '\\r') +    // eslint-disable-line
        // .replace( /\x08/g, '\\b' )
        // .replace( /\x0C/g, '\\f' )
        '"'
    },

    /**
     * 生成数据访问表达式代码
     *
     * @param {Object?} accessorExpr accessor表达式对象
     * @return {string}
     */
    dataAccess: function (accessorExpr = { paths: [] }) {
        const seq = []
        each(accessorExpr.paths, function (path) {
            if (path.type === 4) {
                seq.push(ExpressionEmitter.dataAccess(path))
            } else if (typeof path.value === 'string') {
                seq.push(`"${path.value}"`)
            } else if (typeof path.value === 'number') {
                seq.push(path.value)
            }
        })
        return `_::data($ctx, [${seq.join(', ')}])`
    },

    /**
     * 生成调用表达式代码
     *
     * @param {Object?} callExpr 调用表达式对象
     * @return {string}
     */
    callExpr: function (callExpr) {
        const paths = callExpr.name.paths
        let code = `$ctx->instance->${paths[0].value}`

        for (let i = 1; i < paths.length; i++) {
            const path = paths[i]

            switch (path.type) {
            case 1:
                code += '.' + path.value
                break

            case 2:
                code += '[' + path.value + ']'
                break

            default:
                code += '[' + ExpressionEmitter.expr(path) + ']'
            }
        }

        code += '('
        each(callExpr.args, function (arg, index) {
            code += (index > 0 ? ', ' : '') + ExpressionEmitter.expr(arg)
        })
        code += ')'

        return code
    },

    /**
     * 生成插值代码
     *
     * @param {Object} interpExpr 插值表达式对象
     * @return {string}
     */
    interp: function (interpExpr) {
        let code = ExpressionEmitter.expr(interpExpr.expr)

        each(interpExpr.filters, function (filter) {
            const filterName = filter.name.paths[0].value

            switch (filterName) {
            case '_style':
            case '_class':
                code = `_::${filterName}Filter(${code})`
                break

            case '_xstyle':
            case '_xclass':
                code = `_::${filterName}Filter(${code}, ${ExpressionEmitter.expr(filter.args[0])})`
                break

            case 'url':
                code = `encodeURIComponent(${code})`
                break

            default:
                code = `_::callFilter($ctx, "${filterName}", [${code}`
                each(filter.args, function (arg) {
                    code += ', ' + ExpressionEmitter.expr(arg)
                })
                code += '])'
            }
        })

        if (!interpExpr.original) {
            return `_::escapeHTML(${code})`
        }

        return code
    },

    /**
     * 生成文本片段代码
     *
     * @param {Object} textExpr 文本片段表达式对象
     * @return {string}
     */
    text: function (textExpr) {
        if (textExpr.segs.length === 0) {
            return '""'
        }

        let code = ''

        each(textExpr.segs, function (seg) {
            const segCode = ExpressionEmitter.expr(seg)
            code += code ? ' . ' + segCode : segCode
        })

        return code
    },

    /**
     * 生成数组字面量代码
     *
     * @param {Object} arrayExpr 数组字面量表达式对象
     * @return {string}
     */
    array: function (arrayExpr) {
        const items = []
        const spread = []

        each(arrayExpr.items, function (item) {
            items.push(ExpressionEmitter.expr(item.expr))
            spread.push(item.spread ? 1 : 0)
        })

        return `_::spread([${items.join(', ')}], ${JSON.stringify(spread)})`
    },

    /**
     * 生成对象字面量代码
     *
     * @param {Object} objExpr 对象字面量表达式对象
     * @return {string}
     */
    object: function (objExpr) {
        const items = []
        const spread = []

        each(objExpr.items, function (item) {
            if (item.spread) {
                spread.push(1)
                items.push(ExpressionEmitter.expr(item.expr))
            } else {
                spread.push(0)
                const key = ExpressionEmitter.expr(item.name)
                const val = ExpressionEmitter.expr(item.expr)
                items.push(`[${key}, ${val}]`)
            }
        })
        return `_::objSpread([${items.join(',')}], ${JSON.stringify(spread)})`
    },

    /**
     * 二元表达式操作符映射表
     *
     * @type {Object}
     */
    binaryOp: {
    /* eslint-disable */
    43: '+',
    45: '-',
    42: '*',
    47: '/',
    60: '<',
    62: '>',
    76: '&&',
    94: '!=',
    121: '<=',
    122: '==',
    123: '>=',
    155: '!==',
    183: '===',
    248: '||'
    /* eslint-enable */
    },

    /**
     * 生成表达式代码
     *
     * @param {Object} expr 表达式对象
     * @return {string}
     */
    expr: function (expr) {
        if (expr.parenthesized) {
            return '(' + ExpressionEmitter._expr(expr) + ')'
        }

        return ExpressionEmitter._expr(expr)
    },

    /**
     * 根据表达式类型进行生成代码函数的中转分发
     *
     * @param {Object} expr 表达式对象
     * @return {string}
     */
    _expr: function (expr) {
        switch (expr.type) {
        case 9:
            switch (expr.operator) {
            case 33:
                return '!' + ExpressionEmitter.expr(expr.expr)
            case 45:
                return '-' + ExpressionEmitter.expr(expr.expr)
            }
            return ''

        case 8:
            return ExpressionEmitter.expr(expr.segs[0]) +
                ExpressionEmitter.binaryOp[expr.operator] +
                ExpressionEmitter.expr(expr.segs[1])

        case 10:
            return ExpressionEmitter.expr(expr.segs[0]) +
                '?' + ExpressionEmitter.expr(expr.segs[1]) +
                ':' + ExpressionEmitter.expr(expr.segs[2])

        case 1:
            return ExpressionEmitter.stringLiteralize(expr.literal || expr.value)

        case 2:
            return expr.value

        case 3:
            return expr.value ? 'true' : 'false'

        case 4:
            return ExpressionEmitter.dataAccess(expr)

        case 5:
            return ExpressionEmitter.interp(expr)

        case 7:
            return ExpressionEmitter.text(expr)

        case 12:
            return ExpressionEmitter.array(expr)

        case 11:
            return ExpressionEmitter.object(expr)

        case 6:
            return ExpressionEmitter.callExpr(expr)

        case 13:
            return 'null'
        }
    }
}
