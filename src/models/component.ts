import { PHPClass } from 'ts2php'
import { SanData as OriginSanData, SanComponent, ComponentConstructor } from 'san'
import { CompiledComponent } from './compiled-component'

export interface Computed {
    [k: string]: (this: { data: SanData }) => any
}

export interface Filters {
    [k: string]: (this: CompiledComponent<{}>, ...args: any[]) => any
}

export interface Components {
    [key: string]: typeof SanComponent
}

export const COMPONENT_RESERVED_MEMBERS = new Set(
    'aNode,computed,filters,components,' +
    'initData,template,attached,created,' +
    'detached,disposed,compiled'.split(',')
)

export function isComponentLoader (cmpt: any): cmpt is {placeholder: ComponentConstructor<{}, {}>} {
    return cmpt && cmpt.hasOwnProperty('load') && cmpt.hasOwnProperty('placeholder')
}

interface SanData extends OriginSanData<{}>, PHPClass {
    get (path?: string): any
    set (path: string, value: any): any
}

export class SanSSRFiltersDeclarations {
    [key: string]: (...args: any[]) => any
}

export class SanSSRComputedDeclarations {
    [key: string]: (sanssrSelf: CompiledComponent<{}>) => any
}
