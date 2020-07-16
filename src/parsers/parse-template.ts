import { ParseTemplateOption, ANodeProperty, ExprInterpNode, parseTemplate, ANode } from 'san'
import * as TypeGuards from '../utils/type-guards'
import { parseANodeProps, visitANodeRecursively } from '../utils/anode-util'

export function parseAndNormalizeTemplate (template: string, options: ParseTemplateOption) {
    const rootANode = parseTemplate(template, options).children![0]
    rootANode && normalizeRootANode(rootANode)
    return rootANode
}

/**
 * 归一化 ANode
 *
 * 做的事情类似 san 核心中 preheat 的前期处理，比如
 *
 * - 给 style, class 等添加处理器，使之能从父组件合并 class
 * - <template> 的 tagName 置空，使之接受父组件定义的 tagName
 */
function normalizeRootANode (rootANode: ANode) {
    if (TypeGuards.isATemplateNode(rootANode)) {
        normalizeRootATemplateNode(rootANode)
    }

    for (const prop of rootANode.props || []) {
        if (prop.name === 'class') normalizeRootClassProp(prop)
        else if (prop.name === 'style') normalizeRootStyleProp(prop)
    }

    visitANodeRecursively(rootANode, (aNode: ANode) => {
        if (aNode.tagName === 'option') normalizeOptionTag(aNode)
        normalizeANodeProps(aNode)
    })
}

// ie 下，如果 option 没有 value 属性，select.value = xx 操作不会选中 option
// 所以没有设置 value 时，默认把 option 的内容作为 value
function normalizeOptionTag (aNode: ANode) {
    if (aNode.props.find(prop => prop.name === 'value')) return
    if (!aNode.children!.length) return
    aNode.props.push({
        name: 'value',
        expr: aNode.children![0].textExpr!
    })
}

function normalizeANodeProps (aNode: ANode) {
    if (aNode.props) aNode.props = parseANodeProps(aNode)
}

function normalizeRootClassProp (clazz: ANodeProperty) {
    const parentClassExpr = clazz.expr
    const expr = (parseTemplate('{{class | _xclass}}').children![0].textExpr! as any).segs[0] as ExprInterpNode
    expr.filters[0].args.push(parentClassExpr)
    clazz.expr = expr
}

function normalizeRootStyleProp (style: ANodeProperty) {
    const parentStyleExpr = style.expr
    const expr = (parseTemplate('{{style | _xstyle}}').children![0].textExpr! as any).segs[0] as ExprInterpNode
    expr.filters[0].args.push(parentStyleExpr)
    style.expr = expr
}

function normalizeRootATemplateNode (rootANode: ANode) {
    // 组件根节点，用来让父组件定义根节点 tagName
    // 令 isATemplateNode=false
    rootANode.tagName = ''
}
