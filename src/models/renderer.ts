/**
 * SanProject#compileToRenderer() 输出的 renderer 的类型声明
 */

import { Component } from 'san'
import type { GlobalContext } from './global-context'

export interface Renderer {
    (data: { [key: string]: any }, info?: {
        preferRenderOnly?: boolean | {
            cmpt: string[]
        } | undefined,
        noDataOutput?: boolean,
        parentCtx?: {
            context?: GlobalContext
        },
        tagName?: string,
        ComponentClass?: Component
        slots?: {
            [slotName: string]: Renderer
        }
    }): string
}
