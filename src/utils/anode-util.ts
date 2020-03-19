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

export function getANodeProps (aNode: ANode) {
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
