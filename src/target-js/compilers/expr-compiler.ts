/**
 * 编译源码的 helper 方法集合对象
 */
import { ExprInterpNode, ExprAccessorNode, ExprCallNode, ExprTextNode, ExprNode, ExprObjectNode, ExprArrayNode } from 'san'
import { isValidIdentifier } from '../../utils/lang'
import * as TypeGuards from '../../utils/type-guards'

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
export function dataAccess (accessorExpr?: ExprAccessorNode): string {
    let code = 'componentCtx.data'
    if (!accessorExpr) return code
    for (const path of accessorExpr.paths) {
        const prop = expr(path)
        code += isValidIdentifier(prop) ? `.${prop}` : `[${prop}]`
    }
    return code
}

/**
 * 生成调用表达式代码
 */
export function callExpr (callExpr: ExprCallNode): string {
    const paths = callExpr.name.paths
    let code = 'componentCtx.instance'
    for (const path of paths) {
        const prop = expr(path)
        code += isValidIdentifier(prop) ? `.${prop}` : `[${prop}]`
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
export function interp (interpExpr: ExprInterpNode): string {
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
            const args = filter.args.map((arg: any) => expr(arg))
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
export function text (textExpr: ExprTextNode): string {
    if (textExpr.segs.length === 0) return '""'

    return textExpr.segs
        .map(seg => expr(seg))
        .map(seg => `(${seg})`)
        .join(' + ')
}

/**
 * 生成数组字面量代码
 */
export function array (arrayExpr: ExprArrayNode): string {
    return '[' +
        arrayExpr.items
            .map(e => (e.spread ? '...' : '') + expr(e.expr))
            .join(',') +
        ']'
}

/**
 * 生成对象字面量代码
 */
export function object (objExpr: ExprObjectNode): string {
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
export function expr (e: ExprNode): string {
    if (e.parenthesized) {
        return '(' + _expr(e) + ')'
    }

    return _expr(e)
}

/**
 * 根据表达式类型进行生成代码函数的中转分发
 */
export function _expr (e: ExprNode): string {
    if (TypeGuards.isExprUnaryNode(e)) {
        switch (e.operator) {
        case 33:
            return '!' + expr(e.expr)
        case 45:
            return '-' + expr(e.expr)
        }
        return ''
    }
    if (TypeGuards.isExprBinaryNode(e)) {
        return expr(e.segs[0]) +
            binaryOp[e.operator] +
            expr(e.segs[1])
    }
    if (TypeGuards.isExprTertiaryNode(e)) {
        return expr(e.segs[0]) +
            '?' + expr(e.segs[1]) +
            ':' + expr(e.segs[2])
    }
    if (TypeGuards.isExprStringNode(e)) return stringLiteralize(e.literal || e.value)
    if (TypeGuards.isExprNumberNode(e)) return '' + e.value
    if (TypeGuards.isExprBoolNode(e)) return e.value ? 'true' : 'false'
    if (TypeGuards.isExprAccessorNode(e)) return dataAccess(e)
    if (TypeGuards.isExprInterpNode(e)) return interp(e)
    if (TypeGuards.isExprTextNode(e)) return text(e)
    if (TypeGuards.isExprArrayNode(e)) return array(e)
    if (TypeGuards.isExprObjectNode(e)) return object(e)
    if (TypeGuards.isExprCallNode(e)) return callExpr(e)
    if (TypeGuards.isExprNullNode(e)) return 'null'
    throw new Error(`unexpected expression ${e}`)
}
