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
import type { Component } from 'san'
import type { GlobalContext } from '../models/global-context'

export interface Resolver {
    getRenderer: (ref: { id: string, specifier?: string }, tagName?: string, context?: GlobalContext) => Function
    getChildComponentClass: (
        ref: { id: string, specifier?: string },
        CurrentComponentClass: Component,
        tagName: string,
        context?: GlobalContext
    ) => Component
    setRenderer: (id: string, fn: Function) => void
    /**
     * 每个组件的每次 render 执行，共用同一个 prototype
     * 避免每次创建 SanComponent 实例
     */
    getPrototype: (id: string) => Component<{}>
    setPrototype: (id: string, proto: Component<{}>) => void
}

type nodeRequire = typeof require;

export function createResolver (exports: {[key: string]: any}, require: nodeRequire): Resolver {
    const renderCache = {} as {[key: string]: Function}
    return {
        getRenderer: function ({ id, specifier = '.' }, tagName, context) {
            const customSSRFilePath = context && context.customSSRFilePath
            const cacheKey = id + '  ' + specifier

            // 没有自定义时，尝试缓存
            if (!customSSRFilePath && renderCache[cacheKey]) {
                return renderCache[cacheKey]
            }

            let mod: {[key: string]: any}
            if (specifier === '.') {
                mod = exports
            } else {
                let path: string | undefined
                if (customSSRFilePath) {
                    path = customSSRFilePath({ id, specifier, tagName })
                }
                mod = require(path || specifier)
            }

            if (!customSSRFilePath) {
                renderCache[cacheKey] = mod.sanSSRRenders[id]
            }

            return mod.sanSSRRenders[id]
        },
        getChildComponentClass: function ({ id, specifier = '.' }, instance: Component, tagName: string, context) {
            const customComponentFilePath = context && context.customComponentFilePath
            const pro = Object.getPrototypeOf(instance)
            if (!pro.__componentClassCache) {
                pro.__componentClassCache = {}
            }
            const componentClassCache = pro.__componentClassCache as {[key: string]: Component}
            const cacheKey = tagName

            // 没有自定义时，尝试缓存
            if (!customComponentFilePath && componentClassCache[cacheKey]) {
                return componentClassCache[cacheKey]
            }

            if (customComponentFilePath && specifier !== '.') {
                const path = customComponentFilePath({ id, specifier, tagName })
                if (typeof path === 'string') return id === 'default' ? require(path) : require(path)[id]

                // 可以直接返回一个组件类
                else if (typeof path === 'function') return path
            }

            const components = instance.components || (instance.prototype && instance.prototype.components)
            const ChildComponentClassOrInstance = components && components[tagName]
            if (!ChildComponentClassOrInstance) {
                throw Error(`child component is not fount: ${tagName}${instance.prototype?.id || ''}`)
            }
            if (typeof ChildComponentClassOrInstance === 'string' && ChildComponentClassOrInstance === 'self') {
                componentClassCache[cacheKey] = instance
                return instance
            }
            // component loader
            if (
                Object.prototype.hasOwnProperty.call(ChildComponentClassOrInstance, 'load') &&
                Object.prototype.hasOwnProperty.call(ChildComponentClassOrInstance, 'placeholder')
            ) {
                componentClassCache[cacheKey] = ChildComponentClassOrInstance.placeholder
                return ChildComponentClassOrInstance.placeholder
            }
            if (
                typeof ChildComponentClassOrInstance !== 'function' &&
                typeof ChildComponentClassOrInstance !== 'object'
            ) {
                throw Error(`external component is not provided: ${tagName}${instance.prototype?.id || ''}`)
            }
            componentClassCache[cacheKey] = ChildComponentClassOrInstance
            return ChildComponentClassOrInstance
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
