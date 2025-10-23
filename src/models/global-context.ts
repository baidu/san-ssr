import { Component, DefinedComponentClass } from 'san'

interface ReferInfo {specifier: string; id: string; tagName?: string}

export interface GlobalContext {
    customSSRFilePath?(path: ReferInfo): string
    customComponentFilePath?(info: ReferInfo): string | Component<{}> | DefinedComponentClass<{}>
}
