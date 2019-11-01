export interface Expression {
    original: boolean
    name: Expression
    args: Expression[]
    parenthesized: boolean
    paths: Expression[]
    spread: boolean
    expr: Expression
    items: Expression[]
    value: string
    literal: string
    segs: Expression[]
    type: number
    operator: number
}
