import { ComponentClass } from '../models/component'
import { handleError } from './handle-error'

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
    if (value == null) return ''
    value = String(value)
    return needEscape ? escapeHTML(value) : value
}

function classFilter (source: string | string[]) {
    if (!isArray(source)) source = [source]
    return source.filter(x => x != null).join(' ')
}

function styleFilter (source: object | string) {
    if (isObject(source)) {
        return Object.keys(source)
            .map(key => key + ':' + source[key] + ';')
            .join('')
    }
    return source
}

function xclassFilter (inherits: string | string[], own: string) {
    if (!isArray(inherits)) inherits = [inherits]
    const inheritStr = inherits = inherits.filter(x => x != null).join(' ')
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

function attrFilter (name: string, value: string, needEscape: boolean) {
    // style/class/id 值为 falsy 时不输出属性
    if (value == null || (!value && BASE_PROPS[name])) {
        return ''
    }
    value = String(value)
    return ` ${name}="${needEscape ? escapeHTML(value) : value}"`
}

function boolAttrFilter (name: string, value: string) {
    return value ? ' ' + name : ''
}

function callFilter (ctx: Context, name: string, ...args: any[]) {
    let value
    try {
        value = ctx.instance.filters[name].call(ctx.instance, ...args)
    } catch (e) {
        /* istanbul ignore next */
        handleError(e, ctx.instance, 'filter:' + name)
    }
    return value
}

function callComputed (ctx: Context, name: string) {
    let value
    try {
        value = ctx.instance.computed[name].apply(ctx.instance)
    } catch (e) {
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

function createInstanceFromClass (Clazz: ComponentClass) {
    const inited = Clazz.prototype.inited
    const computed = Clazz['computed']
    const template = Clazz.prototype.template
    delete Clazz.prototype.inited
    delete Clazz['computed']
    Clazz.prototype.template = '<div></div>'

    const instance = new Clazz()
    if (inited) Clazz.prototype.inited = inited
    if (computed) instance['computed'] = Clazz.prototype.computed = Clazz['computed'] = computed
    Clazz.prototype.template = template
    return instance
}

function getRootCtx<T extends {parentCtx?: T}> (ctx: T) {
    while (ctx.parentCtx) ctx = ctx.parentCtx
    return ctx
}

export const _ = {
    output, createInstanceFromClass, escapeHTML, boolAttrFilter, attrFilter, classFilter, styleFilter, xstyleFilter, xclassFilter, createFromPrototype, getRootCtx, iterate, callFilter, callComputed
}
