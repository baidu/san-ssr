import { ComponentInfo } from '../models/component-info'

/**
 * SSR 输出代码的 AST 节点
 */
export interface SyntaxNode {
    kind: SyntaxKind
}

/**
 * 包含 body 语句列表的语法构造
 */
export interface Block extends SyntaxNode {
    body: Iterable<Statement>
}

/**
 * 语法构造的类型
 */
export enum SyntaxKind {
    Null = 0,
    Identifier = 1,
    BinaryExpression = 2,
    ComputedCall = 3,
    UnaryExpression = 4,
    ImportHelper = 5,
    FunctionDefinition = 6,
    VariableDefinition = 7,
    ReturnStatement = 8,
    MapLiteral = 9,
    Literal = 10,
    AssignmentStatement = 11,
    BooleanVariable = 12,
    CreateComponentInstance = 13,
    NewExpression = 14,
    If = 15,
    ComponentRendererReference = 16,
    FunctionCall = 17,
    Foreach = 18,
    ExpressionStatement = 19,
    ElseIf = 20,
    Else = 21,
    MapAssign = 22,
    ArrayIncludes = 23,
    ConditionalExpression = 24,
    FilterCall = 25,
    EncodeURIComponent = 26,
    ArrayLiteral = 27,
    RegexpReplace = 28,
    JSONStringify = 29,
}

export type Expression = Identifier | FunctionDefinition | Literal | BinaryExpression | UnaryExpression | CreateComponentInstance | NewExpression | MapLiteral | ComponentRendererReference | FunctionCall | Null | MapAssign | ArrayIncludes | ConditionalExpression | FilterCall | EncodeURIComponent | ArrayLiteral | RegexpReplace | JSONStringify | ComputedCall

export type Statement = ReturnStatement | ImportHelper | VariableDefinition | AssignmentStatement | If | ElseIf | Else | Foreach | ExpressionStatement

export type BinaryOperator = '+' | '-' | '*' | '/' | '.' | '===' | '!==' | '||' | '&&' | '[]' | '+=' | '!=' | '=='

export type UnaryOperator = '!' | '~' | '+' | '()' | '-'

export class ArrayLiteral implements SyntaxNode {
    public readonly kind = SyntaxKind.ArrayLiteral
    constructor (
        public items: [Expression, boolean][] = []
    ) {}
}

export class MapLiteral implements SyntaxNode {
    public readonly kind = SyntaxKind.MapLiteral
    public items: [Literal | Identifier, Expression, boolean][]
    constructor (
        items: (Literal | Identifier | [Literal | Identifier, Expression, boolean?])[] = []
    ) {
        this.items = items.map(item => Array.isArray(item)
            ? [item[0], item[1], !!item[2]]
            : [item, item, false]
        )
    }
}

export class ComponentRendererReference implements SyntaxNode {
    public readonly kind = SyntaxKind.ComponentRendererReference
    constructor (
        // ref 的值可能是编译时确定的，也可能是运行时确定的（s-is 的情况）
        // 因此它必须是一个表达式，而非 ComponentReference。
        public ref: Expression
    ) {}
}

export class Null implements SyntaxNode {
    public readonly kind = SyntaxKind.Null
}
export class CreateComponentInstance implements SyntaxNode {
    public readonly kind = SyntaxKind.CreateComponentInstance
    constructor (
        public info: ComponentInfo
    ) {}
}

export class NewExpression implements SyntaxNode {
    public readonly kind = SyntaxKind.NewExpression
    constructor (
        public name: Expression,
        public args: Expression[]
    ) {}
}

export class BinaryExpression implements SyntaxNode {
    public readonly kind = SyntaxKind.BinaryExpression
    constructor (
        public lhs: Expression,
        public op: BinaryOperator,
        public rhs: Expression
    ) {}
}

export class RegexpReplace implements SyntaxNode {
    public readonly kind = SyntaxKind.RegexpReplace
    constructor (
        public original: Expression,
        public pattern: string,
        public replacement: Expression
    ) {}
}

export class JSONStringify implements SyntaxNode {
    public readonly kind = SyntaxKind.JSONStringify
    constructor (
        public value: Expression
    ) {}
}

export class ConditionalExpression implements SyntaxNode {
    public readonly kind = SyntaxKind.ConditionalExpression
    constructor (
        public cond: Expression,
        public trueValue: Expression,
        public falseValue: Expression
    ) {}
}

export class UnaryExpression implements SyntaxNode {
    public readonly kind = SyntaxKind.UnaryExpression
    constructor (
        public op: UnaryOperator,
        public value: Expression
    ) {}
}

export class ImportHelper implements SyntaxNode {
    public readonly kind = SyntaxKind.ImportHelper
    constructor (
        public name: string
    ) {}
}

export class VariableDefinition implements SyntaxNode {
    public readonly kind = SyntaxKind.VariableDefinition
    constructor (
        public name: string,
        public initial?: Expression
    ) {}
}

export class If implements SyntaxNode {
    public readonly kind = SyntaxKind.If
    constructor (
        public cond: Expression,
        public body: Iterable<Statement>
    ) {}
}

export class ElseIf implements SyntaxNode {
    public readonly kind = SyntaxKind.ElseIf
    constructor (
        public cond: Expression,
        public body: Iterable<Statement>
    ) {}
}

export class Else implements SyntaxNode {
    public readonly kind = SyntaxKind.Else
    constructor (
        public body: Iterable<Statement>
    ) {}
}

export class Foreach implements SyntaxNode {
    public readonly kind = SyntaxKind.Foreach
    constructor (
        public key: Identifier,
        public value: Identifier,
        public iterable: Expression,
        public body: Iterable<Statement>
    ) {}
}

export class EncodeURIComponent implements SyntaxNode {
    public readonly kind = SyntaxKind.EncodeURIComponent
    constructor (
        public str: Expression
    ) {}
}

export class ComputedCall implements SyntaxNode {
    public readonly kind = SyntaxKind.ComputedCall
    constructor (
        public name: string
    ) {}
}

export class FilterCall implements SyntaxNode {
    public readonly kind = SyntaxKind.FilterCall
    constructor (
        public name: string,
        public args: Expression[]
    ) {}
}

export class FunctionCall implements SyntaxNode {
    public readonly kind = SyntaxKind.FunctionCall
    constructor (
        public fn: Expression,
        public args: Expression[]
    ) {}
}

export class Identifier implements SyntaxNode {
    public readonly kind = SyntaxKind.Identifier
    constructor (
        public name: string
    ) {}
}

export class ExpressionStatement implements SyntaxNode {
    public readonly kind = SyntaxKind.ExpressionStatement
    constructor (
        public expression: Expression
    ) {}
}

export class ArrayIncludes implements SyntaxNode {
    public readonly kind = SyntaxKind.ArrayIncludes
    constructor (
        public arr: Expression,
        public item: Expression
    ) {}
}

export class MapAssign implements SyntaxNode {
    public readonly kind = SyntaxKind.MapAssign
    constructor (
        public dest: Expression,
        public srcs: Expression[]
    ) {}
}

export class AssignmentStatement implements SyntaxNode {
    public readonly kind = SyntaxKind.AssignmentStatement
    constructor (
        public lhs: Expression,
        public rhs: Expression
    ) {}
}

export class FunctionDefinition implements SyntaxNode {
    public readonly kind = SyntaxKind.FunctionDefinition
    constructor (
        public name: string,
        public args: VariableDefinition[] = [],
        public body: Iterable<Statement> = []
    ) {}
}

export class Literal implements SyntaxNode {
    public readonly kind = SyntaxKind.Literal
    constructor (
        public value: any
    ) {}
}

export class ReturnStatement implements SyntaxNode {
    public readonly kind = SyntaxKind.ReturnStatement
    constructor (
        public expression: Expression
    ) {}
}
