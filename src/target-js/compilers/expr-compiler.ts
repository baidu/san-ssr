/**
 * 编译源码的 helper 方法集合
 */
import { ExprStringNode, ExprNode, ExprTertiaryNode, ExprBinaryNode, ExprUnaryNode, ExprInterpNode, ExprAccessorNode, ExprCallNode, ExprTextNode, ExprObjectNode, ExprArrayNode } from 'san'
import { isValidIdentifier } from '../../utils/lang'
import * as TypeGuards from '../../utils/type-guards'
import { _ } from '../../runtime/underscore'
import { stringifier } from './stringifier'

// 输出为 HTML 并转义、输出为 HTML 不转义、非输出表达式
export type OutputType = 'escape' | 'plain' | 'none'

// 二元表达式操作符映射表
const binaryOp = {
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

function unary (e: ExprUnaryNode) {
    if (e.operator === 33) return '!' + expr(e.expr)
    if (e.operator === 45) return '-' + expr(e.expr)
    throw new Error(`unexpected unary operator "${String.fromCharCode(e.operator)}"`)
}
function binary (e: ExprBinaryNode) {
    const lhs = expr(e.segs[0])
    const op = binaryOp[e.operator]
    const rhs = expr(e.segs[1])
    return `${lhs} ${op} ${rhs}`
}
function tertiary (e: ExprTertiaryNode) {
    return `${expr(e.segs[0])} ? ${expr(e.segs[1])} : ${expr(e.segs[2])}`
}

// 生成数据访问表达式代码
export function dataAccess (accessorExpr: ExprAccessorNode | undefined, outputType: OutputType, contextVariableName: string = 'ctx'): string {
    let code = `${contextVariableName}.data`
    if (!accessorExpr) return code
    for (const path of accessorExpr.paths) {
        code += TypeGuards.isExprStringNode(path) && isValidIdentifier(path.value)
            ? `.${path.value}` : `[${expr(path)}]`
    }
    return outputCode(code, outputType)
}

// 生成调用表达式代码
function callExpr (callExpr: ExprCallNode, outputType: OutputType): string {
    const paths = callExpr.name.paths
    let code = 'ctx.instance'
    for (const path of paths) {
        code += TypeGuards.isExprStringNode(path) && isValidIdentifier(path.value)
            ? `.${path.value}` : `[${expr(path)}]`
    }

    code += '('
    code += [...callExpr.args.map(arg => expr(arg)), 'ctx'].join(', ')
    code += ')'

    return outputCode(code, outputType)
}

function outputCode (code: string, outputType: OutputType) {
    if (outputType === 'none') return code
    return `_.output(${code}, ${outputType === 'escape'})`
}

// 生成插值代码
function interp (interpExpr: ExprInterpNode, outputType: OutputType): string {
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
            code = `ctx.instance.filters["${filterName}"].call(ctx.instance, ${code}, ${filter.args.map((arg: any) => expr(arg)).join(', ')})`
        }
    }
    if (outputType === 'escape' && interpExpr.original) outputType = 'plain'
    return outputCode(code, outputType)
}

function str (e: ExprStringNode, output: OutputType): string {
    if (output === 'escape') return stringifier.str(_.escapeHTML(e.value))
    return stringifier.str(e.value)
}

// 生成文本片段代码
function text (textExpr: ExprTextNode, output: OutputType): string {
    return textExpr.segs
        .map(seg => expr(seg, output))
        .map(seg => `${seg}`)
        .join(' + ') || '""'
}

// 生成数组字面量代码
function array (arrayExpr: ExprArrayNode): string {
    return '[' +
            arrayExpr.items
                .map(e => (e.spread ? '...' : '') + expr(e.expr))
                .join(', ') +
            ']'
}

// 生成对象字面量代码
function object (objExpr: ExprObjectNode): string {
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

// expr 的 JavaScript 表达式
export function expr (e: ExprNode, output: OutputType = 'none'): string {
    let s

    if (TypeGuards.isExprUnaryNode(e)) s = unary(e)
    else if (TypeGuards.isExprBinaryNode(e)) s = binary(e)
    else if (TypeGuards.isExprTertiaryNode(e)) s = tertiary(e)
    else if (TypeGuards.isExprStringNode(e)) s = str(e, output)
    else if (TypeGuards.isExprNumberNode(e)) s = '' + e.value
    else if (TypeGuards.isExprBoolNode(e)) s = e.value ? 'true' : 'false'
    else if (TypeGuards.isExprAccessorNode(e)) s = dataAccess(e, output)
    else if (TypeGuards.isExprInterpNode(e)) s = interp(e, output)
    else if (TypeGuards.isExprTextNode(e)) s = text(e, output)
    else if (TypeGuards.isExprArrayNode(e)) s = array(e)
    else if (TypeGuards.isExprObjectNode(e)) s = object(e)
    else if (TypeGuards.isExprCallNode(e)) s = callExpr(e, output)
    else if (TypeGuards.isExprNullNode(e)) s = 'null'
    else throw new Error(`unexpected expression ${JSON.stringify(e)}`)

    return e.parenthesized ? `(${s})` : s
}
