import type { ComponentClass } from './component'

export interface GlobalContext {
    customSSRFilePath?(path: string): string
    customComponentFilePath?(info: {specifier: string; id: string;}): ComponentClass | void
}
