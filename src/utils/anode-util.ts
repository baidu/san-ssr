import * as TypeGuards from './type-guards'
import { camelCase } from 'lodash'
import { ANode, ExprType, ANodeProperty } from 'san'

/**
* 获取 ANode props 数组中相应 name 的项
*/
export function getANodePropByName (aNode: ANode, name: string): ANodeProperty | undefined {
    for (const prop of aNode.props) {
        if (prop['name'] === name) return prop
    }
}

/**
 * 获取 ANode 的 props
 *
 * 做了一点归一化：对于布尔属性，只要 key 存在就把它的值设为 true
 */
export function parseANodeProps (aNode: ANode) {
    return aNode.props.map(p => {
        const prop = { ...p, name: camelCase(p.name) }
        const expr = prop.expr
        if (
            TypeGuards.isExprTextNode(expr) &&
            expr.segs.length === 0 &&
            prop.raw == null
        ) {
            prop.expr = {
                type: ExprType.BOOL,
                value: true,
                raw: 'true'
            }
        }

        return prop
    })
}

/**
 * 先序遍历 ANode 树
 */
export function visitANodeRecursively (aNode: ANode, visitor: (aNode: ANode) => void) {
    visitor(aNode)
    for (const child of aNode.children || []) visitANodeRecursively(child, visitor)
}
