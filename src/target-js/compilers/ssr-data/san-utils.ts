import {
    ANode, ExprType, AElement, AText, Expr, AccessorExpr, CallExpr, StringLiteral, TextExpr,
    InterpExpr, BinaryExpr, UnaryExpr, TertiaryExpr, ObjectLiteral, ArrayLiteral,
    AIfNode
} from 'san'

function isTextNode (node: ANode): node is AText {
    return (node as AText).textExpr != null
}

function isElementNode (node: ANode): node is AElement {
    return (node as AElement).children != null
}

function isAIfNode (node: ANode): node is AIfNode {
    return (node as AIfNode).elses != null
}

function isAccessorExpr (expr: Expr): expr is AccessorExpr {
    return expr.type === ExprType.ACCESSOR
}

function isInterpExpr (expr: Expr): expr is InterpExpr {
    return expr.type === ExprType.INTERP
}

function isCallExpr (expr: Expr): expr is CallExpr {
    return expr.type === ExprType.CALL
}

function isTextExpr (expr: Expr): expr is TextExpr {
    return expr.type === ExprType.TEXT
}

function isBinaryExpr (expr: Expr): expr is BinaryExpr {
    return expr.type === ExprType.BINARY
}

function isUnaryExpr (expr: Expr): expr is UnaryExpr {
    return expr.type === ExprType.UNARY
}

function isTertiaryExpr (expr: Expr): expr is TertiaryExpr {
    return expr.type === ExprType.TERTIARY
}

function isObjectLiteralExpr (expr: Expr): expr is ObjectLiteral {
    return expr.type === ExprType.OBJECT
}

function isArrayExpr (expr: Expr): expr is ArrayLiteral {
    return expr.type === ExprType.ARRAY
}

/**
 * 获取 ANode 中所有函数调用
 * @param root ANode 根节点
 * @returns
 */
export function getANodeExprCalls (root: ANode): {calls: string[], filterCalls: string[]} {
    if (!root) {
        return { calls: [], filterCalls: [] }
    }

    const calls = new Set<string>()
    const filterCalls = new Set<string>()
    const traverseExpr = (expr: Expr) => {
        if (isAccessorExpr(expr)) {
            expr.paths?.forEach(traverseExpr)
        } else if (isInterpExpr(expr)) {
            traverseExpr(expr.expr)
            expr.filters?.forEach(filter => {
                filterCalls.add((filter.name.paths[0] as StringLiteral).value)
                // filter args 也可能是函数调用
                filter.args?.forEach(traverseExpr)
            })
        } else if (isCallExpr(expr)) {
            calls.add((expr.name.paths[0] as StringLiteral).value)
            expr.args?.forEach(traverseExpr)
        } else if (isTextExpr(expr)) {
            expr.segs?.forEach(traverseExpr)
        } else if (isBinaryExpr(expr)) {
            expr.segs?.forEach(traverseExpr)
        } else if (isUnaryExpr(expr)) {
            traverseExpr(expr.expr)
        } else if (isTertiaryExpr(expr)) {
            expr.segs?.forEach(traverseExpr)
        } else if (isObjectLiteralExpr(expr)) {
            expr.items?.forEach(item => traverseExpr(item.expr))
        } else if (isArrayExpr(expr)) {
            expr.items?.forEach(item => traverseExpr(item.expr))
        }
    }
    const traverseNode = (node: ANode) => {
        if (isElementNode(node)) {
            ['if', 'is', 'elif', 'for', 'show', 'bind'].forEach(dirName => {
                const dir = node.directives[dirName as keyof typeof node.directives]
                if (dir) {
                    traverseExpr(dir.value as Expr)
                }
            })
            if (isAIfNode(node)) {
                node.elses?.forEach(elseNode => {
                    traverseNode(elseNode)
                })
            }
            node.vars?.forEach(v => {
                traverseExpr(v.expr)
            })
            node.props?.forEach(p => {
                // event handler 不处理
                traverseExpr(p.expr)
            })
            node.children.forEach(traverseNode)
        } else if (isTextNode(node)) {
            traverseExpr(node.textExpr)
        }
    }

    traverseNode(root)
    return {
        calls: Array.from(calls),
        filterCalls: Array.from(filterCalls)
    }
}
