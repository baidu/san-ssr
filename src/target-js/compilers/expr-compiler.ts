import { Expression } from '../..'

/**
* 编译源码的 helper 方法集合对象
*/
export const compileExprSource = {

    /**
     * 字符串字面化
     */
    stringLiteralize: function (source: string) {
        return '"' + source
            .replace(/\x5C/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t')
            .replace(/\r/g, '\\r') + '"'
    },

    /**
     * 生成数据访问表达式代码
     */
    dataAccess: function (accessorExpr?: Expression): string {
        let code = 'componentCtx.data'
        if (accessorExpr) {
            for (const path of accessorExpr.paths) {
                if (path.type === 4) {
                    code += '[' + compileExprSource.dataAccess(path) + ']'
                    continue
                }

                switch (typeof path.value) {
                case 'string':
                    code += '.' + path.value
                    continue

                case 'number':
                    code += '[' + path.value + ']'
                    continue
                }
            }
        }

        return code
    },

    /**
     * 生成调用表达式代码
     */
    callExpr: function (callExpr: Expression): string {
        const paths = callExpr.name.paths
        let code = 'componentCtx.proto.' + paths[0].value

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
                code += '[' + compileExprSource.expr(path) + ']'
            }
        }

        code += '('
        code += callExpr.args
            .map(arg => compileExprSource.expr(arg))
            .join(',')
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
        let code = compileExprSource.expr(interpExpr.expr)

        for (const filter of interpExpr.filters) {
            const filterName = filter.name.paths[0].value

            switch (filterName) {
            case '_style':
            case '_class':
                code = filterName + 'Filter(' + code + ')'
                break

            case '_xstyle':
            case '_xclass':
                code = filterName + 'Filter(' + code + ', ' + compileExprSource.expr(filter.args[0]) + ')'
                break

            case 'url':
                code = 'encodeURIComponent(' + code + ')'
                break

            default:
                code = 'callFilter(componentCtx, "' + filterName + '", [' + code
                for (const arg of filter.args) {
                    code += ', ' + compileExprSource.expr(arg)
                }
                code += '])'
            }
        }

        if (!interpExpr.original) {
            return 'escapeHTML(' + code + ')'
        }

        return code
    },

    /**
     * 生成文本片段代码
     */
    text: function (textExpr: Expression): string {
        if (textExpr.segs.length === 0) {
            return '""'
        }

        let code = ''

        for (const seg of textExpr.segs) {
            const segCode = compileExprSource.expr(seg)
            code += code ? ' + ' + segCode : segCode
        }

        return code
    },

    /**
     * 生成数组字面量代码
     */
    array: function (arrayExpr: Expression): string {
        return '[\n' +
            arrayExpr.items
                .map(expr => (expr.spread ? '...' : '') + compileExprSource.expr(expr.expr))
                .join(',\n') +
            '\n]'
    },

    /**
     * 生成对象字面量代码
     */
    object: function (objExpr: Expression): string {
        const code = []

        for (const item of objExpr.items) {
            if (item.spread) {
                code.push('...' + compileExprSource.expr(item.expr))
            } else {
                code.push(compileExprSource.expr(item.name) + ':' + compileExprSource.expr(item.expr))
            }
        }

        return '{\n' + code.join(',\n') + '\n}'
    },

    /**
     * 二元表达式操作符映射表
     */
    binaryOp: {
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
    },

    /**
     * 生成表达式代码
     */
    expr: function (expr: Expression): string {
        if (expr.parenthesized) {
            return '(' + compileExprSource._expr(expr) + ')'
        }

        return compileExprSource._expr(expr)
    },

    /**
     * 根据表达式类型进行生成代码函数的中转分发
     */
    _expr: function (expr: Expression): string {
        switch (expr.type) {
        case 9:
            switch (expr.operator) {
            case 33:
                return '!' + compileExprSource.expr(expr.expr)
            case 45:
                return '-' + compileExprSource.expr(expr.expr)
            }
            return ''

        case 8:
            return compileExprSource.expr(expr.segs[0]) +
                compileExprSource.binaryOp[expr.operator] +
                compileExprSource.expr(expr.segs[1])

        case 10:
            return compileExprSource.expr(expr.segs[0]) +
                '?' + compileExprSource.expr(expr.segs[1]) +
                ':' + compileExprSource.expr(expr.segs[2])

        case 1:
            return compileExprSource.stringLiteralize(expr.literal || expr.value)

        case 2:
            return expr.value

        case 3:
            return expr.value ? 'true' : 'false'

        case 4:
            return compileExprSource.dataAccess(expr)

        case 5:
            return compileExprSource.interp(expr)

        case 7:
            return compileExprSource.text(expr)

        case 12:
            return compileExprSource.array(expr)

        case 11:
            return compileExprSource.object(expr)

        case 6:
            return compileExprSource.callExpr(expr)

        case 13:
            return 'null'
        }
    }
}
