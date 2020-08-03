import { ComponentClass } from '../models/component'

const BASE_PROPS = {
    class: 1,
    style: 1,
    id: 1
}

export interface Context {
    parentCtx?: Context;
}

function includes<T> (array: T[], value: T) {
    if (!array) return false
    for (let i = 0; i < array.length; i++) {
        if (array[i] === value) return true
    }
    return false
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
    if (source == null) return ''
    if (typeof source === 'string') {
        return source.replace(rENTITY, (c: string) => HTML_ENTITY[c])
    }
    return '' + source
}

function _classFilter (source: string | string[]) {
    if (!(source instanceof Array)) source = [source]
    return source.filter(x => x != null).join(' ')
}

function isObject (source: any) {
    return typeof source === 'object' && source !== null
}

function _styleFilter (source: object) {
    if (isObject(source)) {
        return Object.keys(source)
            .map(key => key + ':' + source[key] + ';')
            .join('')
    }
    return source
}

function _xclassFilter (inherits: string | string[], own: string) {
    if (!(inherits instanceof Array)) inherits = [inherits]
    const inheritStr = inherits = inherits.filter(x => x != null).join(' ')
    if (inheritStr) {
        if (own) return own + ' ' + inheritStr
        return inheritStr
    }
    return own
}

function _xstyleFilter (inherits: object | string | string[], own: string) {
    inherits = inherits && defaultStyleFilter(inherits)
    if (inherits) {
        if (own) return own + ';' + inherits
        return inherits
    }
    return own
}

function attrFilter (name: string, value: string, needHTMLEscape: boolean) {
    if (value) {
        return ' ' + name + '="' + (needHTMLEscape ? escapeHTML(value) : value) + '"'
    }
    if (value != null && !BASE_PROPS[name]) {
        return ' ' + name + '="' + value + '"'
    }
    return ''
}

function boolAttrFilter (name: string, value: string) {
    return value ? ' ' + name : ''
}

function defaultStyleFilter (source: object | string | string[]) {
    if (isObject(source)) {
        return Object.keys(source)
            .map(key => key + ':' + source[key] + ';')
            .join('')
    }
    return source
}

function createFromPrototype (proto: object) {
    function Creator () {}
    Creator.prototype = proto
    return new (Creator as any)()
}

function createInstanceFromClass (Clazz: ComponentClass) {
    const inited = Clazz.prototype.inited
    const computed = Clazz['computed']
    delete Clazz.prototype.inited
    delete Clazz['computed']

    const instance = new Clazz()
    if (inited) Clazz.prototype.inited = inited
    if (computed) instance['computed'] = Clazz.prototype.computed = Clazz['computed'] = computed
    return instance
}

function getRootCtx<T extends {parentCtx?: T}> (ctx: T) {
    while (ctx.parentCtx) ctx = ctx.parentCtx
    return ctx
}

export const _ = {
    createInstanceFromClass, escapeHTML, defaultStyleFilter, boolAttrFilter, attrFilter, includes, _classFilter, _styleFilter, _xstyleFilter, _xclassFilter, createFromPrototype, getRootCtx
}
