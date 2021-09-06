/**
 * SanProject#compileToRenderer() 输出的 renderer 的类型声明
 */

import type { ComponentClass } from './component'
import type { GlobalContext } from './global-context'

export interface Renderer {
    (data: { [key: string]: any }, info?: {
        noDataOutput?: boolean,
        parentCtx?: {
            context?: GlobalContext
        },
        tagName?: string,
        ComponentClass?: ComponentClass
    }): string
}
