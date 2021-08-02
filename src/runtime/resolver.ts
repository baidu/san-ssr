/**
 * 该文件可能会以字符串形式直接输出到产物中
 * 因此不能引用外部模块，会因找不到外部模块报错
 */
/**
 * 组件间依赖解决
 *
 * 这个文件定义了 render 函数如何获取 ComponentClass，
 * 以及 render 函数如何获取其他 render 函数（可能在同一文件，也可能在外部文件）。
 *
 * render 函数（本文件的调用方）可能会输出为源代码，也可能在当前上下文执行。
 * 后者没有文件的概念，因此不得依赖 require、exports 等文件级别的概念。
 *
 * - 不能引用文件系统的其他组件 render：require(ref.specifier)
 * - 也不能利用 exports 引用当前文件的其他组件： exports.sanSSRRenders.X()
 */
import { SanComponent } from 'san'
import type { GlobalContext } from '../models/global-context'

export interface Resolver {
    getRenderer: (ref: { id: string, specifier?: string }, context?: GlobalContext) => Function
    setRenderer: (id: string, fn: Function) => void
    /**
     * 每个组件的每次 render 执行，共用同一个 prototype
     * 避免每次创建 SanComponent 实例
     */
    getPrototype: (id: string) => SanComponent<{}>
    setPrototype: (id: string, proto: SanComponent<{}>) => void
}

type nodeRequire = typeof require;

export function createResolver (exports: {[key: string]: any}, require: nodeRequire): Resolver {
    return {
        getRenderer: function ({ id, specifier = '.' }, context) {
            const customRequirePath = context && context.customRequirePath
            let mod: {[key: string]: any}
            if (specifier === '.') {
                mod = exports
            } else {
                let path: string | undefined
                if (customRequirePath) {
                    path = customRequirePath(require.resolve(specifier))
                }
                mod = require(path || specifier)
            }
            return mod.sanSSRRenders[id]
        },
        setRenderer: function (id: string, fn: Function) {
            exports.sanSSRRenders = exports.sanSSRRenders || {}
            exports.sanSSRRenders[id] = fn
        },
        getPrototype: function (id: string) {
            return this['prototypes'][id]
        },
        setPrototype: function (id: string, proto: any) {
            this['prototypes'][id] = proto
        },
        prototypes: {}
    } as Resolver
}
