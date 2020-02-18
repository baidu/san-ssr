import { inspect } from 'util'
import { isNumber, keys, isFunction } from 'lodash'
import { ComponentInfo } from '../models/component-info'
import { getMember } from '../utils/lang'
import { Components, ComponentClass, Filters, Computed, isComponentClass } from '../models/component'

/**
* 组件解析器，创建并维护组件树
*/
export class ComponentParser {
    private id = 1

    parseComponent (componentClass: ComponentClass): ComponentInfo {
        if (!isComponentClass(componentClass)) {
            throw new Error(`${inspect(componentClass)} is not likely a San Component`)
        }
        const filters = this.parseFilters(getMember(componentClass, 'filters', {}))
        const computed = this.parseComputed(getMember(componentClass, 'computed', {}))
        const template = getMember(componentClass, 'template', '')
        const childComponentClasses: Components = getMember<Components>(componentClass, 'components', {})
        const cid = isNumber(componentClass['sanssrCid']) ? componentClass['sanssrCid'] : this.id
        this.id = Math.max(cid, this.id) + 1

        return new ComponentInfo({
            filters, computed, template, componentClass, cid, childComponentClasses
        })
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
