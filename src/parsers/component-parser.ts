import { ComponentInfo } from '../models/component-info'
import { getMember } from '../utils/lang'
import { Components, Filters, Computed } from '../models/component'
import { ComponentConstructor } from 'san'
import { isNumber, keys, isFunction } from 'lodash'

export class ComponentParser {
    private id = 1

    /**
    * 组件解析器，创建并维护组件树
    */
    parseComponent (ComponentClass: ComponentConstructor<{}, {}>): ComponentInfo {
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
