import { resolve } from 'path'
import { _ } from './underscore'
import { createResolver } from './resolver'
import { SanSSRData } from './san-ssr-data'
import { JSEmitter } from '../target-js/js-emitter'
import { readStringSync } from '../utils/fs'

/**
 * 编译成源代码时，需要包含的运行时文件
 */
const HELPER_FILES = [
    resolve(__dirname, '../../dist/runtime/underscore.js'),
    resolve(__dirname, '../../dist/runtime/san-data.js'),
    resolve(__dirname, '../../dist/runtime/resolver.js')
]

export interface SanSSRHelpers {
    /**
     * 无状态的工具库，类似 lodash
     */
    _: typeof _
    /**
     * SanSSRData 的 SSR 运行时替代品
     */
    SanSSRData: typeof SanSSRData
    /**
     * 组件 render、Class 解析器
     */
    createResolver: typeof createResolver
}

/**
 * 产出运行时代码
 */
export function emitHelpersAsIIFE (emitter: JSEmitter) {
    emitter.feedLine('(function (exports) {')
    emitter.indent()

    emitHelpers(emitter)
    emitter.writeLine('return exports;')

    emitter.unindent()
    emitter.writeLine('})({});')
}

/**
 * 产出运行时代码
 */
export function emitHelpers (emitter: JSEmitter) {
    for (const file of HELPER_FILES) {
        emitter.writeLines(readStringSync(file))
        emitter.carriageReturn()
    }
}

/**
 * 编译成 render 函数时，使用的 helper
 */
export function createHelpers (): SanSSRHelpers {
    return { _, SanSSRData, createResolver }
}
