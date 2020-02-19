import { SanComponent, ComponentConstructor } from 'san'
import { CompiledComponent } from './compiled-component'
import { SanData } from './san-data'

export interface Computed {
    [k: string]: (this: { data: SanData }) => any
}

export interface Filters {
    [k: string]: (this: CompiledComponent<{}>, ...args: any[]) => any
}

export type ComponentClass = ComponentConstructor<{}, {}>

export interface Components {
    [key: string]: ComponentClass | { load: any, placeholder: ComponentClass }
}

export const COMPONENT_RESERVED_MEMBERS = new Set(
    'aNode,computed,filters,components,' +
    'initData,template,attached,created,' +
    'detached,disposed,compiled'.split(',')
)

export function isComponentLoader (cmpt: any): cmpt is {placeholder: ComponentClass} {
    return cmpt && cmpt.hasOwnProperty('load') && cmpt.hasOwnProperty('placeholder')
}

export function isComponentClass (clazz: any): clazz is typeof SanComponent {
    return typeof clazz === 'function' &&
        (typeof clazz.template === 'string' || typeof clazz.prototype.template === 'string')
}

export class SanSSRFiltersDeclarations {
    [key: string]: (...args: any[]) => any
}

export class SanSSRComputedDeclarations {
    [key: string]: (sanssrSelf: CompiledComponent<{}>) => any
}
