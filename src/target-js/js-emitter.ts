import { FilterCall, Foreach, FunctionDefinition, ComputedCall, ArrayLiteral, UnaryExpression, MapLiteral, Statement, SyntaxKind, Expression, VariableDefinition } from '../ast/syntax-node'
import { Emitter } from '../utils/emitter'
import { assertNever } from '../utils/lang'

export class JSEmitter extends Emitter {
    public writeExpression (node: Expression) {
        switch (node.kind) {
        case SyntaxKind.Literal:
            return this.write(node.value instanceof Date
                ? `new Date(${node.value.getTime()})`
                : JSON.stringify(node.value, (k, v) => {
                    if (v instanceof Date) return `new Date(${v.getTime()})`
                    return v
                }))
        case SyntaxKind.Identifier:
            return this.write(node.name)
        case SyntaxKind.ArrayIncludes:
            this.writeExpression(node.arr)
            this.write('.includes(')
            this.writeExpression(node.item)
            this.write(')')
            break
        case SyntaxKind.MapAssign:
            this.write('Object.assign(')
            this.writeExpressionList([node.dest, ...node.srcs])
            this.write(')')
            break
        case SyntaxKind.RegexpReplace:
            this.writeExpression(node.original)
            this.write(`.replace(/${node.pattern}/g, `)
            this.writeExpression(node.replacement)
            this.write(')')
            break
        case SyntaxKind.JSONStringify:
            this.write('JSON.stringify(')
            this.writeExpression(node.value)
            this.write(')')
            break
        case SyntaxKind.BinaryExpression:
            if (node.op === '.') {
                this.writeExpression(node.lhs)
                this.write('.')
                this.writeExpression(node.rhs)
            } else if (node.op === '[]') {
                this.writeExpression(node.lhs)
                this.write('[')
                this.writeExpression(node.rhs)
                this.write(']')
            } else {
                this.writeExpression(node.lhs)
                this.write(` ${node.op} `)
                this.writeExpression(node.rhs)
            }
            break
        case SyntaxKind.ConditionalExpression:
            this.writeExpression(node.cond)
            this.write(' ? ')
            this.writeExpression(node.trueValue)
            this.write(' : ')
            this.writeExpression(node.falseValue)
            break
        case SyntaxKind.EncodeURIComponent:
            this.write('encodeURIComponent(')
            this.writeExpression(node.str)
            this.write(')')
            break
        case SyntaxKind.ComputedCall:
            return this.writeComputedCall(node)
        case SyntaxKind.FilterCall:
            return this.writeFilterCall(node)
        case SyntaxKind.FunctionDefinition:
            return this.writeFunctionDefinition(node)
        case SyntaxKind.FunctionCall:
            this.writeExpression(node.fn)
            this.write('(')
            this.writeExpressionList(node.args)
            this.write(')')
            break
        case SyntaxKind.CreateComponentInstance:
            this.write(`_.createFromPrototype(sanSSRResolver.getPrototype("${node.info.id}"));`)
            break
        case SyntaxKind.Null:
            this.write('null')
            break
        case SyntaxKind.NewExpression:
            this.write('new ')
            this.writeExpression(node.name)
            this.write('(')
            this.writeExpressionList(node.args)
            this.write(')')
            break
        case SyntaxKind.UnaryExpression:
            return this.writeUnaryExpression(node)
        case SyntaxKind.ArrayLiteral:
            return this.writeArrayLiteral(node)
        case SyntaxKind.MapLiteral:
            return this.writeMapLiteral(node)
        case SyntaxKind.ComponentRendererReference:
            this.write('sanSSRResolver.getRenderer(')
            this.writeExpression(node.ref)
            this.write(')')
            break
        default: assertNever(node)
        }
    }

    public writeStatement (node: Statement) {
        switch (node.kind) {
        case SyntaxKind.ReturnStatement:
            this.nextLine('return ')
            this.writeExpression(node.expression)
            this.feedLine(';')
            break
        case SyntaxKind.ExpressionStatement:
            this.nextLine('')
            this.writeExpression(node.expression)
            this.feedLine(';')
            break
        case SyntaxKind.ImportHelper:
            this.writeLine(`const ${node.name} = sanSSRHelpers.${node.name};`)
            break
        case SyntaxKind.AssignmentStatement:
            this.nextLine('')
            this.writeExpression(node.lhs)
            this.write(' = ')
            this.writeExpression(node.rhs)
            this.feedLine(';')
            break
        case SyntaxKind.VariableDefinition:
            this.writeVariableDefinition(node)
            break
        case SyntaxKind.If:
            this.nextLine('if (')
            this.writeExpression(node.cond)
            this.write(') ')
            this.writeBlockStatements(node.body)
            break
        case SyntaxKind.ElseIf:
            this.nextLine('else if (')
            this.writeExpression(node.cond)
            this.write(') ')
            this.writeBlockStatements(node.body)
            break
        case SyntaxKind.Else:
            this.nextLine('else ')
            this.writeBlockStatements(node.body)
            break
        case SyntaxKind.Foreach:
            return this.writeForeachStatement(node)
        default: assertNever(node)
        }
    }

    private writeForeachStatement (node: Foreach) {
        this.nextLine('for (let [')
        this.writeExpression(node.key)
        this.write(', ')
        this.writeExpression(node.value)
        this.write('] of _.iterate(')
        this.writeExpression(node.iterable)
        this.write(')) ')
        this.writeBlockStatements(node.body)
    }

    public writeFunctionDefinition (node: FunctionDefinition) {
        this.write(`function ${node.name} (`)
        let first = true
        for (const arg of node.args) {
            if (!first) this.write(', ')
            this.write(arg.name)
            if (arg.initial) {
                this.write(' = ')
                this.writeExpression(arg.initial)
            }
            first = false
        }
        this.write(') {')
        this.indent()
        for (const stmt of node.body) this.writeStatement(stmt)
        this.unindent()
        this.write('}')
    }

    private writeBlockStatements (body: Iterable<Statement>) {
        this.feedLine('{')
        this.indent()
        for (const stmt of body) this.writeStatement(stmt)
        this.unindent()
        this.writeLine('}')
    }

    private writeVariableDefinition (node: VariableDefinition) {
        this.nextLine(`let ${node.name}`)
        if (node.initial) {
            this.write(' = ')
            this.writeExpression(node.initial)
        }
    }

    private writeComputedCall (node: ComputedCall) {
        this.write(`_.callComputed(ctx, "${node.name}")`)
    }

    private writeFilterCall (node: FilterCall) {
        if (['_style', '_class', '_xstyle', '_xclass', '_attr', '_boolAttr'].includes(node.name)) {
            this.write(`_.${node.name}Filter(`)
        } else {
            this.write(`_.callFilter(ctx, "${node.name}", `)
        }
        this.writeExpressionList(node.args)
        this.write(')')
    }

    private writeArrayLiteral (node: ArrayLiteral) {
        let first = true
        this.write('[')
        for (const [item, spread] of node.items) {
            if (!first) this.write(', ')
            if (spread) this.write('...')
            this.writeExpression(item)
            first = false
        }
        this.write(']')
    }

    private writeUnaryExpression (node: UnaryExpression) {
        if (node.op === '()') {
            this.write('(')
            this.writeExpression(node.value)
            this.write(')')
        } else {
            this.write(node.op)
            this.writeExpression(node.value)
        }
    }

    private writeMapLiteral (node: MapLiteral) {
        let first = true
        this.write('{')
        for (const [k, v, spread] of node.items) {
            if (!first) this.write(', ')
            if (spread) {
                this.write('...')
                this.writeExpression(v)
            } else if (k === v) {
                this.writeExpression(k)
            } else {
                this.writeExpression(k)
                this.write(': ')
                this.writeExpression(v)
            }
            first = false
        }
        this.write('}')
    }

    private writeExpressionList (list: Expression[]) {
        for (let i = 0; i < list.length; i++) {
            this.writeExpression(list[i])
            if (i !== list.length - 1) this.write(', ')
        }
    }

    public writeFunction (name = '', args: string[] = [], body: Function = () => null) {
        const nameStr = name ? `${name} ` : ''
        const argsStr = args.join(', ')
        this.writeBlock(`function ${nameStr}(${argsStr})`, () => body(), false)
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
        this.unindent()
        nl ? this.writeLine('}') : this.nextLine('}')
    }
}
