import { ComponentConstructor, ANode } from 'san'
import { noop, isNumber, keys, isFunction } from 'lodash'
import { CompiledComponent } from '../models/compiled-component'
import { ComponentInfo } from '../models/component-info'
import { getMember } from '../utils/lang'
import { isComponentLoader, Components, ComponentClass, Filters, Computed } from '../models/component'

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
        const component = ComponentParser.createComponentInstance(componentClass)
        const computed = this.parseComputed(getMember(componentClass, 'computed', {}))
        const template = getMember(componentClass, 'template', '')
        const childComponentClasses = this.parseChildComponentClasses(componentClass, component)
        const cid = isNumber(componentClass['sanssrCid']) ? componentClass['sanssrCid'] : this.id
        this.id = Math.max(cid, this.id) + 1

        return new ComponentInfo({
            filters, computed, template, componentClass, cid, childComponentClasses, component
        })
    }

    public static createComponentInstance (componentClass: ComponentClass): CompiledComponent<{}> {
        // TODO Do not `new Component` during SSR,
        // see https://github.com/baidu/san-ssr/issues/42
        const ComponentClass = componentClass
        const proto = ComponentClass.prototype['__proto__']    // eslint-disable-line
        const calcComputed = proto['_calcComputed']
        const inited = ComponentClass.prototype['inited']
        proto['_calcComputed'] = noop
        ComponentClass.prototype['inited'] = undefined
        const instance = new ComponentClass()
        ComponentClass.prototype['inited'] = inited
        proto['_calcComputed'] = calcComputed
        return instance as CompiledComponent<{}>
    }

    private parseChildComponentClasses (componentClass: ComponentClass, component: CompiledComponent<{}>): Components {
        const children: Components = new Map()

        const components: { [key: string]: ComponentConstructor<{}, {}> } = getMember(componentClass, 'components', {})
        for (const [tagName, componentClass] of Object.entries(components)) {
            children.set(tagName, componentClass)
        }

        if (typeof component.getComponentType === 'function') {
            this.visitANodeRecursively(component.aNode, (aNode: ANode) => {
                const childClazz = component.getComponentType!(aNode)
                if (childClazz) children.set(aNode, childClazz)
            })
        }
        return children
    }

    private visitANodeRecursively (aNode: ANode, visitor: (aNode: ANode) => void) {
        visitor(aNode)
        for (const child of aNode.children || []) this.visitANodeRecursively(child, visitor)
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
