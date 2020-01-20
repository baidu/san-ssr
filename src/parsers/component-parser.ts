import { ComponentInfo } from '../models/component-info'
import { inspect } from 'util'
import { getMember } from '../utils/lang'
import { Components, Filters, Computed, isComponentClass } from '../models/component'
import { ComponentConstructor } from 'san'
import { isNumber, keys, isFunction } from 'lodash'

/**
* 组件解析器，创建并维护组件树
*/
export class ComponentParser {
    private id = 1

    parseComponent (ComponentClass: ComponentConstructor<{}, {}>): ComponentInfo {
        if (!isComponentClass(ComponentClass)) {
            throw new Error(`${inspect(ComponentClass)} is not likely a San Component`)
        }
        const filters = this.parseFilters(getMember(ComponentClass, 'filters', {}))
        const computed = this.parseComputed(getMember(ComponentClass, 'computed', {}))
        const template = getMember(ComponentClass, 'template', '')
        const components = getMember<Components>(ComponentClass, 'components', {})
        const cid = isNumber(ComponentClass['sanssrCid']) ? ComponentClass['sanssrCid'] : this.id
        this.id = Math.max(cid, this.id) + 1

        return new ComponentInfo({
            filters, computed, template, ComponentClass, cid, components
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
