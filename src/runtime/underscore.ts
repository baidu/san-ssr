const BASE_PROPS = {
    'class': 1,
    'style': 1,
    'id': 1
}

interface Context {
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
    return source instanceof Array ? source.join(' ') : source
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

function _xclassFilter (outer: string | string[], inner: string) {
    if (outer instanceof Array) outer = outer.join(' ')
    if (outer) {
        if (inner) return inner + ' ' + outer
        return outer
    }
    return inner
}

function _xstyleFilter (outer: object | string | string[], inner: string) {
    outer = outer && defaultStyleFilter(outer)
    if (outer) {
        if (inner) return inner + ';' + outer
        return outer
    }
    return inner
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

function getRootCtx (ctx: Context) {
    while (ctx.parentCtx) ctx = ctx.parentCtx
    return ctx
}

export const _ = {
    escapeHTML, defaultStyleFilter, boolAttrFilter, attrFilter, includes, _classFilter, _styleFilter, _xstyleFilter, _xclassFilter, createFromPrototype, getRootCtx
}
