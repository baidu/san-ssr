import * as TypeGuards from './type-guards'
import { camelCase } from 'lodash'
// import { booleanAttributes } from './dom-util'
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
        postProp(prop)
        return prop
    })
}

/**
* 对属性信息进行处理
* 对组件的 binds 或者特殊的属性（比如 input 的 checked）需要处理
*
* 扁平化：
* 当 text 解析只有一项时，要么就是 string，要么就是 interp
* interp 有可能是绑定到组件属性的表达式，不希望被 eval text 成 string
* 所以这里做个处理，只有一项时直接抽出来
*
* bool属性：
* 当绑定项没有值时，默认为true
*
* @param {Object} prop 属性对象
*/
function postProp (prop: ANodeProperty) {
    const expr = prop.expr
    if (!TypeGuards.isExprTextNode(expr)) return

    if (expr.segs.length === 0) {
        // TODO 支持新的 boolean 属性逻辑
        // if (booleanAttributes.has(prop.name)) {
        if (prop.raw == null) {
            prop.expr = {
                type: ExprType.BOOL,
                value: true
            }
        }
    } else if (expr.segs.length === 1) {
        prop.expr = expr.segs[0]
        if (TypeGuards.isExprInterpNode(prop.expr) && prop.expr.filters.length === 0) {
            prop.expr = prop.expr.expr
        }
    }
}
