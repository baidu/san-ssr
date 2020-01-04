import { ANode } from './anode'
import { PHPClass } from 'ts2php'
import { SanData as OriginSanData, Component as OriginSanComponent } from 'san'

export interface Computed {
    [k: string]: (this: { data: SanData }) => any
}

export interface Filters {
    [k: string]: (this: SanComponent, ...args: any[]) => any
}

/**
 * 编译期的 Component 类型
 * 供编译器内部的 TypeScript 代码使用，不提供给组件作者
 */
export class SanComponent extends OriginSanComponent {
    static components?: Components
    static sanssrCid?: number
    static placeholder?: typeof SanComponent
    static computed?: Computed;
    static filters?: Filters;

    data: SanData
    components?: Components
    aNode: ANode
    tagName: string;
    getComponentType?: (aNode: ANode) => typeof SanComponent;
    initData?(): any;
    inited?(): any;
    computed?: Computed;
    filters?: Filters;
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
