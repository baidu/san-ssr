/**
 * 编译源码的 helper 方法集合对象
 */
import { Expression } from '../../models/expression'
import { isString } from 'lodash'
import { isValidIdentifier } from '../../utils/lang'

/**
 * 字符串字面化
 */
export function stringLiteralize (source: string) {
    return '"' + source
        .replace(/\x5C/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t')
        .replace(/\r/g, '\\r') + '"'
}

/**
 * 生成数据访问表达式代码
 */
export function dataAccess (accessorExpr?: Expression): string {
    let code = 'componentCtx.data'
    if (!accessorExpr) return code
    for (const path of accessorExpr.paths) {
        if (path.type === 4) {
            code += '[' + dataAccess(path) + ']'
        } else if (isString(path.value) && isValidIdentifier(path.value)) {
            code += '.' + path.value
        } else {
            code += '[' + path.value + ']'
        }
    }
    return code
}

/**
 * 生成调用表达式代码
 */
export function callExpr (callExpr: Expression): string {
    const paths = callExpr.name.paths
    let code = 'componentCtx.instance.' + paths[0].value

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
            code += '[' + expr(path) + ']'
        }
    }

    code += '('
    const argValues = callExpr.args.map(arg => expr(arg))
    code += [...argValues, 'componentCtx'].join(',')
    code += ')'

    return code
}

/**
 * 生成插值代码
 */
export function interp (interpExpr): string {
    let code = expr(interpExpr.expr)

    for (const filter of interpExpr.filters) {
        const filterName = filter.name.paths[0].value

        switch (filterName) {
        case '_style':
        case '_class':
            code = `_.${filterName}Filter(${code})`
            break

        case '_xstyle':
        case '_xclass':
            code = `_.${filterName}Filter(${code}, ${expr(filter.args[0])})`
            break

        case 'url':
            code = `encodeURIComponent(${code})`
            break

        default:
            const args = filter.args.map(arg => expr(arg))
            code = `_.callFilter(componentCtx, "${filterName}", [${code}, ${args.join(', ')}])`
        }
    }

    if (!interpExpr.original) {
        return '_.escapeHTML(' + code + ')'
    }

    return code
}

/**
 * 生成文本片段代码
 */
export function text (textExpr: Expression): string {
    if (textExpr.segs.length === 0) return '""'

    return textExpr.segs
        .map(seg => expr(seg))
        .map(seg => `(${seg})`)
        .join(' + ')
}

/**
 * 生成数组字面量代码
 */
export function array (arrayExpr: Expression): string {
    return '[' +
        arrayExpr.items
            .map(e => (e.spread ? '...' : '') + expr(e.expr))
            .join(',') +
        ']'
}

/**
 * 生成对象字面量代码
 */
export function object (objExpr: Expression): string {
    const code: string[] = []

    for (const item of objExpr.items) {
        if (item.spread) {
            code.push('...' + expr(item.expr))
        } else {
            code.push(expr(item.name) + ':' + expr(item.expr))
        }
    }

    return '{\n' + code.join(',\n') + '\n}'
}

/**
 * 二元表达式操作符映射表
 */
export const binaryOp = {
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
}

/**
 * 生成表达式代码
 */
export function expr (expr: Expression): string {
    if (expr.parenthesized) {
        return '(' + _expr(expr) + ')'
    }

    return _expr(expr)
}

/**
 * 根据表达式类型进行生成代码函数的中转分发
 */
export function _expr (e: Expression): string {
    switch (e.type) {
    case 9:
        switch (e.operator) {
        case 33:
            return '!' + expr(e.expr)
        case 45:
            return '-' + expr(e.expr)
        }
        return ''
    case 8:
        return expr(e.segs[0]) +
            binaryOp[e.operator] +
            expr(e.segs[1])
    case 10:
        return expr(e.segs[0]) +
            '?' + expr(e.segs[1]) +
            ':' + expr(e.segs[2])
    case 1:
        return stringLiteralize(e.literal || e.value)
    case 2:
        return e.value
    case 3:
        return e.value ? 'true' : 'false'
    case 4:
        return dataAccess(e)
    case 5:
        return interp(e)
    case 7:
        return text(e)
    case 12:
        return array(e)
    case 11:
        return object(e)
    case 6:
        return callExpr(e)
    case 13:
        return 'null'
    }
    throw new Error(`unexpected expression ${e}`)
}
