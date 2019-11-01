import { Expression } from './expression'

export interface ANode {
    hotspot: ANode
    events: any
    directives: {
        bind: ANode
        elif?: ANode
        html?: ANode
        item: string
        index: string
    }
    tagName: string
    props: ANodeProp[]
    children: ANode[]

    name?: string
    value?: Expression
    expr?: Expression
    textExpr?: Expression
    ifRinsed?: ANode
    elif?: ANode
    elses?: ANode[]
    vars?: ANode[]
}

export interface ANodeProp {
    name: string
    expr
    x
    raw: string
}
