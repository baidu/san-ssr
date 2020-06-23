const BASE_PROPS = {
    'class': 1,
    'style': 1,
    'id': 1
}

function extend (target: object, source: object) {
    if (!source) return target
    Object.keys(source).forEach(function (key) {
        target[key] = source[key]
    })
    return target
}

function includes<T> (array: T[], value: T) {
    if (!array) return false
    for (let i = 0; i < array.length; i++) {
        if (array[i] === value) return true
    }
    return false
}

const HTML_ENTITY = {
    /* jshint ignore:start */
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    /* eslint-disable quotes */
    "'": '&#39;'
    /* eslint-enable quotes */
    /* jshint ignore:end */
}

function escapeHTML (source: any) {
    if (source == null) return ''
    if (typeof source === 'string') {
        return source.replace(/[&<>"']/g, (c: string) => HTML_ENTITY[c])
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

export const _ = {
    escapeHTML, defaultStyleFilter, boolAttrFilter, attrFilter, extend, includes, _classFilter, _styleFilter, _xstyleFilter, _xclassFilter, createFromPrototype
}
