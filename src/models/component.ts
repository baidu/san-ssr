import { ANode } from './anode'
import { PHPClass } from 'ts2php'
import { SanData as OriginSanData, Component as OriginSanComponent } from 'san'

export class SanComponent extends OriginSanComponent {
    static components?: Components
    static sanssrCid?: number
    static placeholder?: typeof SanComponent

    data: SanData
    components?: Components
    aNode: ANode
    getComponentType?: (aNode: ANode) => typeof SanComponent;
    initData?: () => any;
    inited?: () => any;
    computed?: any;
}

interface Components {
    [key: string]: typeof SanComponent
}

export const COMPONENT_RESERVED_MEMBERS = new Set(
    'aNode,computed,filters,components,' +
    'initData,template,attached,created,' +
    'detached,disposed,compiled'.split(',')
)

export function isComponentLoader (cmpt: any) {
    return cmpt && cmpt.hasOwnProperty('load') && cmpt.hasOwnProperty('placeholder')
}

export function isComponentClass (clazz: any): clazz is typeof SanComponent {
    return typeof clazz === 'function' &&
        (typeof clazz.template === 'string' || typeof clazz.prototype.template === 'string')
}

interface SanData extends OriginSanData<{}>, PHPClass {
    get (path?: string): any
    set (path: string, value: any): any
}

export class SanSSRFiltersDeclarations {
    [key: string]: (...args: any[]) => any
}

export class SanSSRComputedDeclarations {
    [key: string]: (sanssrSelf: SanComponent) => any
}
