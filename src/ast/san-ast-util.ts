/**
 * San 模板 AST 工具库
 *
 * Spec: https://github.com/baidu/san/blob/master/doc/anode.md
 * 可视化工具: https://astexplorer.net/ 选择语言为 San
 *
 * 对 san ast 做简单的处理，如果有复杂功能，建议引入 https://github.com/ecomfe/san-anode-utils
 */

import * as TypeGuards from './san-ast-type-guards'
import { ExprType, AProperty, AElement, AIfNode, ANode } from 'san'

/**
* 获取 ANode props 数组中相应 name 的项
*/
export function getANodePropByName (aNode: AElement, name: string): AProperty | undefined {
    for (const prop of aNode.props) {
        if (prop.name === name) return prop
    }
}

/**
 * 获取 ANode 的 props
 *
 * 做了一点归一化：对于布尔属性，只要 key 存在就把它的值设为 true
 */
export function parseANodeProps (aNode: AElement) {
    return aNode.props.map(prop => {
        if (
            (
                TypeGuards.isExprTextNode(prop.expr) ||
                TypeGuards.isExprStringNode(prop.expr)
            ) && prop.noValue
        ) {
            prop.expr = {
                type: ExprType.BOOL,
                // @ts-ignore
                value: true
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
    if (TypeGuards.isATextNode(aNode)) return
    for (const child of aNode.children || []) visitANodeRecursively(child, visitor)
    for (const els of (aNode as AIfNode).elses || []) visitANodeRecursively(els, visitor)
}
