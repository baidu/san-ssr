import { Literal, Foreach, FunctionDefinition, ArrayLiteral, UnaryExpression, MapLiteral, Statement, SyntaxKind, Expression, VariableDefinition, SlotRendererDefinition } from '../ast/renderer-ast-dfn'
import { Emitter } from '../utils/emitter'
import { assertNever } from '../utils/lang'

/**
 * 用来表示 JSON 里这一部分是一个 Date
 *
 * 完全正确的实现是每次使用时生成，可以确保当前字符串不包含 INDICATOR
 * 但一般来讲 32 位十进制数已经足够抗冲突，n = 2 时冲突概率为 1/10**32
 */
const LITERAL_DATE_INDICATOR = Math.random().toString(36) + Math.random().toString(36)

// 此处的性能问题体现在编译时，因此可以 trade off
const LITERAL_DATE_MATCHER = new RegExp(`"${LITERAL_DATE_INDICATOR}(\\d+)"`, 'g')

export class JSEmitter extends Emitter {
    public writeSyntaxNode (node: Expression | Statement) {
        switch (node.kind) {
        case SyntaxKind.Literal:
            return this.writeLiteral(node)
        case SyntaxKind.Identifier:
            return this.write(node.name)
        case SyntaxKind.ArrayIncludes:
            this.writeSyntaxNode(node.arr)
            this.write('.includes(')
            this.writeSyntaxNode(node.item)
            this.write(')')
            break
        case SyntaxKind.MapAssign:
            this.write('Object.assign(')
            this.writeExpressionList([node.dest, ...node.srcs])
            this.write(')')
            break
        case SyntaxKind.RegexpReplace:
            this.writeSyntaxNode(node.original)
            this.write(`.replace(/${node.pattern}/g, `)
            this.writeSyntaxNode(node.replacement)
            this.write(')')
            break
        case SyntaxKind.JSONStringify:
            this.write('JSON.stringify(')
            this.writeSyntaxNode(node.value)
            this.write(')')
            break
        case SyntaxKind.BinaryExpression:
            if (node.op === '.') {
                this.writeSyntaxNode(node.lhs)
                this.write('.')
                this.writeSyntaxNode(node.rhs)
            } else if (node.op === '[]') {
                this.writeSyntaxNode(node.lhs)
                this.write('[')
                this.writeSyntaxNode(node.rhs)
                this.write(']')
            } else {
                this.writeSyntaxNode(node.lhs)
                this.write(` ${node.op} `)
                this.writeSyntaxNode(node.rhs)
            }
            break
        case SyntaxKind.ConditionalExpression:
            this.writeSyntaxNode(node.cond)
            this.write(' ? ')
            this.writeSyntaxNode(node.trueValue)
            this.write(' : ')
            this.writeSyntaxNode(node.falseValue)
            break
        case SyntaxKind.EncodeURIComponent:
            this.write('encodeURIComponent(')
            this.writeSyntaxNode(node.value)
            this.write(')')
            break
        case SyntaxKind.ComputedCall:
            this.write(`_.callComputed(ctx, "${node.name}")`)
            break
        case SyntaxKind.FilterCall:
            this.write(`_.callFilter(ctx, "${node.name}", `)
            this.writeExpressionList(node.args)
            this.write(')')
            break
        case SyntaxKind.GetRootCtxCall:
            this.write('_.getRootCtx(')
            this.writeExpressionList(node.args)
            this.write(')')
            break
        case SyntaxKind.HelperCall:
            this.write(`_.${node.name}(`)
            this.writeExpressionList(node.args)
            this.write(')')
            break
        case SyntaxKind.FunctionDefinition:
        case SyntaxKind.SlotRendererDefinition:
            return this.writeFunctionDefinition(node)
        case SyntaxKind.FunctionCall:
        case SyntaxKind.SlotRenderCall:
            this.writeSyntaxNode(node.fn)
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
        case SyntaxKind.Undefined:
            this.write('undefined')
            break
        case SyntaxKind.NewExpression:
            this.write('new ')
            this.writeSyntaxNode(node.name)
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
            this.writeSyntaxNode(node.value)
            this.write(')')
            break
        case SyntaxKind.ComponentReferenceLiteral:
            this.writeSyntaxNode(node.toMapLiteral())
            break
        case SyntaxKind.ReturnStatement:
            this.nextLine('return ')
            this.writeSyntaxNode(node.value)
            this.feedLine(';')
            break
        case SyntaxKind.ExpressionStatement:
            this.nextLine('')
            this.writeSyntaxNode(node.value)
            this.feedLine(';')
            break
        case SyntaxKind.ImportHelper:
            this.writeLine(`const ${node.name} = sanSSRHelpers.${node.name};`)
            break
        case SyntaxKind.AssignmentStatement:
            this.nextLine('')
            this.writeSyntaxNode(node.lhs)
            this.write(' = ')
            this.writeSyntaxNode(node.rhs)
            this.feedLine(';')
            break
        case SyntaxKind.VariableDefinition:
            this.writeVariableDefinition(node)
            break
        case SyntaxKind.If:
            this.nextLine('if (')
            this.writeSyntaxNode(node.cond)
            this.write(') ')
            this.writeBlockStatements(node.body)
            break
        case SyntaxKind.ElseIf:
            this.nextLine('else if (')
            this.writeSyntaxNode(node.cond)
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

    /**
     * 把一个字面量对象按 JS 语法输出。例如：{ foo: new Date(333) }
     */
    public writeLiteral (node: Literal) {
        // JSON.stringify 时 toJSON 在 replacer 之前调用。
        // 因此 replacer 无法检测当前是否为 Date，value 总是 string 类型。
        // 此处替换掉 toJSON 来模拟一个 replacer 的行为。
        const toJSON = Date.prototype.toJSON;
        (Date.prototype as any).toJSON = function () {
            return LITERAL_DATE_INDICATOR + this.getTime()
        }
        // 利用 toJSON 不能直接实现，因为 JS Date 无法表达为 JSON 字符串。
        const str = JSON.stringify(node.value).replace(LITERAL_DATE_MATCHER, 'new Date($1)');
        (Date.prototype as any).toJSON = toJSON

        return this.write(str)
    }

    private writeForeachStatement (node: Foreach) {
        this.nextLine('for (let [')
        this.writeSyntaxNode(node.key)
        this.write(', ')
        this.writeSyntaxNode(node.value)
        this.write('] of _.iterate(')
        this.writeSyntaxNode(node.iterable)
        this.write(')) ')
        this.writeBlockStatements(node.body)
    }

    public writeFunctionDefinition (node: FunctionDefinition | SlotRendererDefinition) {
        this.write(`function ${node.name} (`)
        let first = true
        for (const arg of node.args) {
            if (!first) this.write(', ')
            this.write(arg.name)
            if (arg.initial) {
                this.write(' = ')
                this.writeSyntaxNode(arg.initial)
            }
            first = false
        }
        this.write(') {')
        this.indent()
        for (const stmt of node.body) this.writeSyntaxNode(stmt)
        this.unindent()
        this.write('}')
    }

    private writeBlockStatements (body: Iterable<Statement>) {
        this.feedLine('{')
        this.indent()
        for (const stmt of body) this.writeSyntaxNode(stmt)
        this.unindent()
        this.writeLine('}')
    }

    private writeVariableDefinition (node: VariableDefinition) {
        this.nextLine(`let ${node.name}`)
        if (node.initial) {
            this.write(' = ')
            this.writeSyntaxNode(node.initial)
        }
    }

    private writeArrayLiteral (node: ArrayLiteral) {
        let first = true
        this.write('[')
        for (const [item, spread] of node.items) {
            if (!first) this.write(', ')
            if (spread) this.write('...')
            this.writeSyntaxNode(item)
            first = false
        }
        this.write(']')
    }

    private writeUnaryExpression (node: UnaryExpression) {
        if (node.op === '()') {
            this.write('(')
            this.writeSyntaxNode(node.value)
            this.write(')')
        } else {
            this.write(node.op)
            this.writeSyntaxNode(node.value)
        }
    }

    private writeMapLiteral (node: MapLiteral) {
        let first = true
        this.write('{')
        for (const [k, v, spread] of node.items) {
            if (!first) this.write(', ')
            if (spread) {
                this.write('...')
                this.writeSyntaxNode(v)
            } else if (k === v) {
                this.writeSyntaxNode(k)
            } else {
                this.writeSyntaxNode(k)
                this.write(': ')
                this.writeSyntaxNode(v)
            }
            first = false
        }
        this.write('}')
    }

    private writeExpressionList (list: Expression[]) {
        for (let i = 0; i < list.length; i++) {
            this.writeSyntaxNode(list[i])
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

    public beginBlock (expr: string, nl: boolean) {
        const text = `${expr ? expr + ' ' : ''}{`
        nl ? this.writeLine(text) : this.feedLine(text)
        this.indent()
    }

    public endBlock (nl: boolean) {
        this.unindent()
        nl ? this.writeLine('}') : this.nextLine('}')
    }
}
