/**
 * ANode 的 Type Guard
 *
 * ANode Spec: https://github.com/baidu/san/blob/master/doc/anode.md
 */

import {
    // Expression Nodes
    Expr, ExprType,
    NullLiteral, StringLiteral, NumberLiteral,
    BoolLiteral,

    // ANodes
    ANode, AIfNode, AForNode, ASlotNode, AText, AccessorExpr, InterpExpr, CallExpr, TextExpr, BinaryExpr, UnaryExpr,
    TertiaryExpr, ArrayLiteral, ObjectLiteral, AFragmentNode, ADynamicNode
} from 'san'

/*
 * TypeGuards for Expression Node
 */
export function isExprStringNode (node: Expr): node is StringLiteral {
    return node.type === ExprType.STRING
}

export function isExprNumberNode (node: Expr): node is NumberLiteral {
    return node.type === ExprType.NUMBER
}

export function isExprBoolNode (node: Expr): node is BoolLiteral {
    return node.type === ExprType.BOOL
}

export function isExprNullNode (node: Expr): node is NullLiteral {
    return node.type === ExprType.NULL
}

export function isExprAccessorNode (node: Expr): node is AccessorExpr {
    return node.type === ExprType.ACCESSOR
}

export function isExprInterpNode (node: Expr): node is InterpExpr {
    return node.type === ExprType.INTERP
}

export function isExprCallNode (node: Expr): node is CallExpr {
    return node.type === ExprType.CALL
}

export function isExprTextNode (node: Expr): node is TextExpr {
    return node.type === ExprType.TEXT
}

export function isExprBinaryNode (node: Expr): node is BinaryExpr {
    return node.type === ExprType.BINARY
}

export function isExprUnaryNode (node: Expr): node is UnaryExpr {
    return node.type === ExprType.UNARY
}

export function isExprTertiaryNode (node: Expr): node is TertiaryExpr {
    return node.type === ExprType.TERTIARY
}

export function isExprObjectNode (node: Expr): node is ObjectLiteral {
    return node.type === ExprType.OBJECT
}

export function isExprArrayNode (node: Expr): node is ArrayLiteral {
    return node.type === ExprType.ARRAY
}

type ExprWithValue = StringLiteral | NumberLiteral | BoolLiteral | TextExpr

export function isExprWithValue (node: Expr): node is ExprWithValue {
    return node && Object.prototype.hasOwnProperty.call(node, 'value')
}

/*
 * TypeGuards for ANode
 */

export function isASlotNode (aNode: ANode): aNode is ASlotNode {
    return !isATextNode(aNode) && aNode.tagName === 'slot'
}

export function isAIfNode (aNode: ANode): aNode is AIfNode {
    return !isATextNode(aNode) && !!aNode.directives.if
}

export function isADynamicNode (aNode: ANode): aNode is ADynamicNode {
    return !isATextNode(aNode) && !!aNode.directives.is
}

export function isAForNode (aNode: ANode): aNode is AForNode {
    return !isATextNode(aNode) && !!aNode.directives.for
}

export function isATextNode (aNode: ANode): aNode is AText {
    return aNode && Object.prototype.hasOwnProperty.call(aNode, 'textExpr')
}

export function isAFragmentNode (aNode: ANode): aNode is AFragmentNode {
    return !isATextNode(aNode) && (aNode.tagName === 'fragment' || aNode.tagName === 'template')
}
