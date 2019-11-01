import { ANode } from './anode'

/**
 * Compiled Component Class
 */
export class Component {
    static template?: string
    template?: string

    static components?: {[key: string]: typeof Component}
    components?: {[key: string]: Component}

    aNode: ANode
    data: Data
    getComponentType?: (aNode: ANode) => typeof Component

    static sanssrCid: number
}

export const COMPONENT_RESERVED_MEMBERS = new Set(
    'aNode,computed,filters,components,' +
    'initData,template,attached,created,' +
    'detached,disposed,compiled'.split(',')
)

export function isComponentLoader (cmpt: any) {
    return cmpt && cmpt.hasOwnProperty('load') && cmpt.hasOwnProperty('placeholder')
}

export function isComponentClass (clazz: any): clazz is typeof Component {
    return typeof clazz === 'function' &&
        (clazz.template || clazz.prototype.template)
}

class Data {
    public get (path?: string): any {
        return path
    }
}
