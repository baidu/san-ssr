import { ANodeProperty, ExprInterpNode, parseTemplate, ComponentConstructor, ANode } from 'san'
import { isNumber, keys, isFunction } from 'lodash'
import { CompiledComponent } from '../models/compiled-component'
import { ComponentInfo } from '../models/component-info'
import { getMember } from '../utils/lang'
import { isComponentLoader, Components, ComponentClass, Filters, Computed } from '../models/component'
import * as TypeGuards from '../utils/type-guards'

/**
* 组件解析器，创建并维护组件树
*/
export class ComponentParser {
    private id = 1

    parseComponent (componentClass: ComponentClass): ComponentInfo | undefined {
        if (isComponentLoader(componentClass)) {
            componentClass = componentClass.placeholder
        }
        if (!componentClass) return

        const filters = this.parseFilters(getMember(componentClass, 'filters', {}))
        const computed = this.parseComputed(getMember(componentClass, 'computed', {}))
        const template = getMember(componentClass, 'template', '')
        const rootANode = parseTemplate(template).children![0]
        rootANode && normalizeRootANode(rootANode)

        const childComponentClasses = this.parseChildComponentClasses(componentClass, rootANode)
        const cid = isNumber(componentClass['sanssrCid']) ? componentClass['sanssrCid'] : this.id
        this.id = Math.max(cid, this.id) + 1

        return new ComponentInfo({
            filters, computed, template, componentClass, cid, childComponentClasses, rootANode
        })
    }

    private parseChildComponentClasses (componentClass: ComponentClass, rootANode: ANode): Components {
        const children: Components = new Map()

        const components: { [key: string]: ComponentConstructor<{}, {}> } = getMember(componentClass, 'components', {})
        for (const [tagName, componentClass] of Object.entries(components)) {
            children.set(tagName, componentClass)
        }

        if (typeof componentClass.prototype.getComponentType === 'function') {
            visitANodeRecursively(rootANode, (aNode: ANode) => {
                const childClazz = componentClass.prototype.getComponentType!(aNode)
                if (childClazz) children.set(aNode, childClazz)
            })
        }
        return children
    }

    private parseFilters (filters: any): Filters {
        const ret: Filters = {}
        for (const key of keys(filters)) {
            if (!isFunction(filters[key])) continue
            ret[key] = filters[key]
        }
        return ret
    }

    private parseComputed (filters: any): Computed {
        const ret: Computed = {}
        for (const key of keys(filters)) {
            if (!isFunction(filters[key])) continue
            ret[key] = filters[key]
        }
        return ret
    }
}

function visitANodeRecursively (aNode: ANode, visitor: (aNode: ANode) => void) {
    visitor(aNode)
    for (const child of aNode.children || []) visitANodeRecursively(child, visitor)
}

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
    })
}

// ie 下，如果 option 没有 value 属性，select.value = xx 操作不会选中 option
// 所以没有设置 value 时，默认把 option 的内容作为 value
function normalizeOptionTag (aNode: ANode) {
    if (aNode.props.find(prop => prop.name === 'value')) return
    if (!aNode.children!.length) return
    aNode.props.push({
        name: 'value',
        expr: aNode.children![0].textExpr!,
        raw: ''
    })
}

function normalizeRootClassProp (clazz: ANodeProperty) {
    const parentClassExpr = clazz.expr
    const expr = parseTemplate('{{class | _xclass}}').children![0].textExpr!.segs[0] as ExprInterpNode
    expr.filters[0].args.push(parentClassExpr)
    clazz.expr = expr
}

function normalizeRootStyleProp (style: ANodeProperty) {
    const parentStyleExpr = style.expr
    const expr = parseTemplate('{{style | _xstyle}}').children![0].textExpr!.segs[0] as ExprInterpNode
    expr.filters[0].args.push(parentStyleExpr)
    style.expr = expr
}

function normalizeRootATemplateNode (rootANode: ANode) {
    // 组件根节点，用来让父组件定义根节点 tagName
    // 令 isATemplateNode=false
    (rootANode as ANode).tagName = ''
}
