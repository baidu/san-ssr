import { ComponentClass } from './component'

interface ReferInfo {specifier: string; id: string; tagName?: string}

export interface GlobalContext {
    customSSRFilePath?(path: ReferInfo): string
    customComponentFilePath?(info: ReferInfo): string | ComponentClass
}
