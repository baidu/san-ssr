/**
 * 在 San 核心之外，提供额外的 San 组件的类型信息和工具
 */
import { SanData, ComponentConstructor, SanComponent } from 'san'

export interface Computed {
    [k: string]: (this: { data: SanData<{}> }) => any
}

export interface Filters {
    [k: string]: (this: SanComponent<{}>, ...args: any[]) => any
}

export type ComponentClass = ComponentConstructor<{}, {}>

export const COMPONENT_RESERVED_MEMBERS = new Set(
    [
        // 组件内
        'constructor',
        'aNode',
        'components',
        'template',
        'attached',
        'created',
        'detached',
        'disposed',
        'compiled',

        // san 的 Component
        '_initSourceSlots',
        'nodeType',
        'nextTick',
        '_ctx',
        '_toPhase',
        'on',
        'un',
        'fire',
        '_calcComputed',
        'dispatch',
        'slot',
        'ref',
        '_update',
        '_updateBindxOwner',
        '_repaintChildren',
        '_initDataChanger',
        'watch',
        '_getElAsRootNode',
        'attach',
        'detach',
        'dispose',
        '_onEl',
        '_attached',
        '_leave',
        '_callHook'
    ]
)

export function isComponentLoader (cmpt: any): cmpt is {placeholder: ComponentClass} {
    return cmpt && Object.prototype.hasOwnProperty.call(cmpt, 'load') && Object.prototype.hasOwnProperty.call(cmpt, 'placeholder')
}
