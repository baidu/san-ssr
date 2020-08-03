import { SanData, ComponentConstructor, SanComponent } from 'san'

export interface Computed {
    [k: string]: (this: { data: SanData<{}> }) => any
}

export interface Filters {
    [k: string]: (this: SanComponent<{}>, ...args: any[]) => any
}

export type ComponentClass = ComponentConstructor<{}, {}>

export const COMPONENT_RESERVED_MEMBERS = new Set(
    ('constructor,aNode,components,' +
    'template,attached,created,' +
    'detached,disposed,compiled').split(',')
)

export function isComponentLoader (cmpt: any): cmpt is {placeholder: ComponentClass} {
    return cmpt && Object.prototype.hasOwnProperty.call(cmpt, 'load') && Object.prototype.hasOwnProperty.call(cmpt, 'placeholder')
}
