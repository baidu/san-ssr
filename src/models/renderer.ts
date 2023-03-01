/**
 * SanProject#compileToRenderer() 输出的 renderer 的类型声明
 */

import { Component } from 'san'
import type { GlobalContext } from './global-context'

export type Renderer = (data: { [key: string]: any }, info?: RendererInfo) => string

export interface RendererInfo {
    preferRenderOnly?: boolean,
    noDataOutput?: boolean,
    parentCtx?: {
        context?: GlobalContext
    },
    outputData?: Record<string, unknown> | ((data: Record<string, unknown>) => Record<string, unknown>),
    ComponentClass?: Component
}
export type InnerRendererInfo = RendererInfo & {
    preferRenderOnly?: boolean | {
        cmpt: string[]
    }
    tagName?: string
    attrs?: string[]
    slots?: {
        [slotName: string]: Renderer
    }

    // not root Component
    isChild: boolean
    rootOutputData: Record<string, unknown>
}
