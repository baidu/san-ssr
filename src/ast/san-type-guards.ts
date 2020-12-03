import {
    // Expression Nodes
    ExprNode, ExprType,
    ExprNullNode, ExprObjectNode, ExprArrayNode, ExprStringNode, ExprNumberNode,
    ExprBoolNode, ExprAccessorNode, ExprInterpNode, ExprCallNode, ExprTextNode,
    ExprBinaryNode, ExprUnaryNode, ExprTertiaryNode,

    // ANodes
    ANode, AIfNode, AForNode, ASlotNode, ATextNode, ATemplateNode, AFragmentNode
} from 'san'

/*
 * TypeGuards for Expression Node
 */
export function isExprUnaryNode (node: ExprNode): node is ExprUnaryNode {
    return node.type === ExprType.UNARY
}

export function isExprStringNode (node: ExprNode): node is ExprStringNode {
    return node.type === ExprType.STRING
}

export function isExprNumberNode (node: ExprNode): node is ExprNumberNode {
    return node.type === ExprType.NUMBER
}

export function isExprBoolNode (node: ExprNode): node is ExprBoolNode {
    return node.type === ExprType.BOOL
}

export function isExprAccessorNode (node: ExprNode): node is ExprAccessorNode {
    return node.type === ExprType.ACCESSOR
}

export function isExprInterpNode (node: ExprNode): node is ExprInterpNode {
    return node.type === ExprType.INTERP
}

export function isExprCallNode (node: ExprNode): node is ExprCallNode {
    return node.type === ExprType.CALL
}

export function isExprTextNode (node: ExprNode): node is ExprTextNode {
    return node.type === ExprType.TEXT
}

export function isExprBinaryNode (node: ExprNode): node is ExprBinaryNode {
    return node.type === ExprType.BINARY
}

export function isExprTertiaryNode (node: ExprNode): node is ExprTertiaryNode {
    return node.type === ExprType.TERTIARY
}

export function isExprArrayNode (node: ExprNode): node is ExprArrayNode {
    return node.type === ExprType.ARRAY
}

export function isExprObjectNode (node: ExprNode): node is ExprObjectNode {
    return node.type === ExprType.OBJECT
}

export function isExprNullNode (node: ExprNode): node is ExprNullNode {
    return node.type === ExprType.NULL
}

/*
 * TypeGuards for ANode
 */

export function isASlotNode (aNode: ANode): aNode is ASlotNode {
    return aNode.tagName === 'slot'
}

export function isAIfNode (aNode: ANode): aNode is AIfNode {
    return !!aNode.directives.if
}

export function isAForNode (aNode: ANode): aNode is AForNode {
    return !!aNode.directives.for
}

export function isATextNode (aNode: ANode): aNode is ATextNode {
    return !!aNode.textExpr
}

export function isATemplateNode (aNode: ANode): aNode is ATemplateNode {
    return aNode.tagName === 'template'
}

export function isAFragmentNode (aNode: ANode): aNode is AFragmentNode {
    return aNode.tagName === 'fragment'
}
