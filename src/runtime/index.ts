import { resolve } from 'path'
import { _ } from './underscore'
import { Resolver, createResolver } from './resolver'
import { SanData } from './san-data'
import { Emitter } from '../utils/emitter'
import { readStringSync } from '../utils/fs'

/**
 * 编译成源代码时，需要包含的运行时文件
 */
const RUNTIME_FILES = [
    resolve(__dirname, '../../dist/runtime/underscore.js'),
    resolve(__dirname, '../../dist/runtime/san-data.js'),
    resolve(__dirname, '../../dist/runtime/resolver.js')
]

export interface SanSSRRuntime {
    /**
     * 无状态的工具库，类似 lodash
     */
    _: typeof _
    /**
     * SanData 的 SSR 运行时替代品
     */
    SanData: typeof SanData
    /**
     * 组件 render、Class 解析器
     */
    resolver: Resolver
    /**
     * 当前目标文件的 exports 对象
     */
    exports: { [key: string]: any }
}

/**
 * 产出运行时代码
 */
export function emitRuntime (emitter: Emitter) {
    emitter.writeLine(`var sanSSRRuntime = { exports };`)
    for (const file of RUNTIME_FILES) {
        emitter.writeLine(`!(function (exports) {`)
        emitter.indent()
        emitter.writeLines(readStringSync(file))
        emitter.unindent()
        emitter.writeLine(`})(sanSSRRuntime);`)
    }
    emitter.writeLine(`sanSSRRuntime.resolver = sanSSRRuntime.createResolver(exports)`)
}

/**
 * 编译成 render 函数时，使用的 helper
 */
export function createRuntime (): SanSSRRuntime {
    const exports = {}
    return { _, SanData, resolver: createResolver(exports), exports }
}
