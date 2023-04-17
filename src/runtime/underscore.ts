/**
 * 该文件可能会以字符串形式直接输出到产物中
 * 因此不能引用外部模块，会因找不到外部模块报错
 */

import type { Component, ComponentDefineOptions } from 'san'

const BASE_PROPS = {
    class: 1,
    style: 1,
    id: 1
}

export interface Context {
    parentCtx?: Context;
    instance: any
}

const HTML_ENTITY = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '\u00a0': '&nbsp;',
    '\u2003': '&emsp;',
    '\u2002': '&ensp;',
    '\u2009': '&thinsp;',
    '\xa9': '&copy;',
    '\xae': '&reg;',
    '\u200c': '&zwnj;',
    '\u200d': '&zwj;',
    '&': '&amp;'
}
const rENTITY = new RegExp(`[${Object.keys(HTML_ENTITY).join('')}]`, 'g')

function escapeHTML (source: any) {
    if (typeof source === 'string') {
        return source.replace(rENTITY, (c: string) => HTML_ENTITY[c])
    }
    return source
}

function isObject (source: any) {
    return typeof source === 'object' && source !== null
}

function isArray (source: any): source is any[] {
    return source && source instanceof Array
}

function output (value: any, needEscape: boolean) {
    if (value == null || value === '') {
        return ''
    }
    value = '' + value
    return needEscape ? escapeHTML(value) : value
}

function classFilter (source: string | string[]) {
    if (!isArray(source)) {
        source = [source]
    }
    let res = ''
    for (let i = 0; i < source.length; i++) {
        const s = source[i]
        if (s != null) {
            if (i !== 0) {
                res += ' '
            }
            res += s
        }
    }
    return res
}

function styleFilter (source: object | string) {
    if (isObject(source)) {
        const keys = Object.keys(source)
        let res = ''
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            res += (key + ':' + source[key] + ';')
        }
        return res
    }
    return source
}

function xclassFilter (inherits: string | string[], own: string) {
    const inheritStr = classFilter(inherits)

    if (inheritStr) {
        if (own) return own + ' ' + inheritStr
        return inheritStr
    }
    return own
}

function xstyleFilter (inherits: object | string, own: string) {
    inherits = inherits && styleFilter(inherits)
    if (inherits) {
        if (own) return own + ';' + inherits
        return inherits
    }
    return own
}

function attrFilter (name: string, value: string | number | boolean, needEscape: boolean) {
    // style/class/id 值为 falsy 时不输出属性
    if (value == null || (!value && BASE_PROPS[name])) {
        return ''
    }
    value = '' + value
    return ` ${name}="${needEscape ? escapeHTML(value) : value}"`
}

function boolAttrFilter (name: string, value: string | number | boolean) {
    return value ? ' ' + name : ''
}

function callFilter (ctx: Context, name: string, ...args: any[]) {
    let value
    try {
        value = ctx.instance.filters[name].call(ctx.instance, ...args)
    } catch (e: any) {
        /* istanbul ignore next */
        handleError(e, ctx.instance, 'filter:' + name)
    }
    return value
}

function callComputed (ctx: Context, name: string) {
    let value
    try {
        value = ctx.instance.computed[name].apply(ctx.instance)
    } catch (e: any) {
        /* istanbul ignore next */
        handleError(e, ctx.instance, 'computed:' + name)
    }
    return value
}

function iterate (val: any[] | object) {
    return isArray(val) ? val.entries() : Object.entries(val)
}

function createFromPrototype (proto: object) {
    function Creator () {}
    Creator.prototype = proto
    return new (Creator as any)()
}

function createInstanceFromClass (Clazz: Component<{}> & ComponentDefineOptions) {
    // method
    // compiled inited initData
    const inited = Clazz.prototype.inited
    delete Clazz.prototype.inited
    const initData = Clazz.prototype.initData
    delete Clazz.prototype.initData

    // property
    // template filters components computed trimWhitespace delimiters
    const template = Clazz.template || Clazz.prototype.template
    const components = Clazz.components || Clazz.prototype.components
    delete Clazz.components
    delete Clazz.prototype.components
    const computed = Clazz.computed || Clazz.prototype.computed
    delete Clazz.computed
    delete Clazz.prototype.computed

    Clazz.prototype.template = '<div></div>'

    const instance = new Clazz()
    if (inited) Clazz.prototype.inited = inited
    if (initData) Clazz.prototype.initData = initData
    if (components) Clazz.prototype.components = components
    Clazz.prototype.template = template
    if (computed) instance['computed'] = Clazz.prototype.computed = Clazz.computed = computed
    return instance
}

function handleError (e: Error, instance: Component<{}>, info: string) {
    let current: Component<{}> | undefined = instance
    while (current) {
        if (typeof current.error === 'function') {
            current.error(e, instance, info)
            return
        }
        current = current.parentComponent
    }

    throw e
}

function mergeChildSlots (childSlots: {[name: string]: Function}) {
    const sourceSlots = {
        named: {} as {[name: string]: boolean},
        noname: false
    }
    const keys = Object.keys(childSlots)
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (key === '') {
            sourceSlots.noname = true
            continue
        }

        sourceSlots.named[key] = true
    }
    return sourceSlots
}

export const _ = {
    output,
    createInstanceFromClass,
    escapeHTML,
    boolAttrFilter,
    attrFilter,
    classFilter,
    styleFilter,
    xstyleFilter,
    xclassFilter,
    createFromPrototype,
    iterate,
    callFilter,
    callComputed,
    handleError,
    mergeChildSlots
}
