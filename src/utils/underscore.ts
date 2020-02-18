import { CompileContext } from '../target-js/compilers/renderer-compiler'

const BASE_PROPS = {
    'class': 1,
    'style': 1,
    'id': 1
}

function extend (target: object, source: object) {
    if (source) {
        Object.keys(source).forEach(function (key) {
            const value = source[key]
            if (typeof value !== 'undefined') {
                target[key] = value
            }
        })
    }

    return target
}

function each<T> (array: T[], iterator: (item: T, index: number) => boolean) {
    if (array && array.length > 0) {
        for (let i = 0, l = array.length; i < l; i++) {
            if (iterator(array[i], i) === false) {
                break
            }
        }
    }
}

function contains<T> (array: T[], value: T) {
    let result
    each(array, function (item) {
        result = item === value
        return !result
    })

    return result
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

function htmlFilterReplacer (c: string) {
    return HTML_ENTITY[c]
}

function escapeHTML (source: any) {
    if (source == null) {
        return ''
    }

    if (typeof source === 'string') {
        return source ? source.replace(/[&<>"']/g, htmlFilterReplacer) : ''
    }

    return '' + source
}

// TODO remove this
function _classFilter (source: string | string[]) {
    if (source instanceof Array) {
        return source.join(' ')
    }

    return source
}

function _styleFilter (source: object) {
    if (typeof source === 'object') {
        let result = ''
        if (source) {
            Object.keys(source).forEach(function (key) {
                result += key + ':' + source[key] + ';'
            })
        }

        return result
    }

    return source
}

function _xclassFilter (outer: string | string[], inner: string) {
    if (outer instanceof Array) {
        outer = outer.join(' ')
    }

    if (outer) {
        if (inner) {
            return inner + ' ' + outer
        }

        return outer
    }

    return inner
}

function _xstyleFilter (outer: object | string | string[], inner: string) {
    outer = outer && defaultStyleFilter(outer)
    if (outer) {
        if (inner) {
            return inner + ';' + outer
        }

        return outer
    }

    return inner
}

function attrFilter (name: string, value: string, needHTMLEscape: boolean) {
    if (value) {
        return ' ' + name + '="' + (needHTMLEscape ? escapeHTML(value) : value) + '"'
    } else if (value != null && !BASE_PROPS[name]) {
        return ' ' + name + '="' + value + '"'
    }

    return ''
}

function boolAttrFilter (name: string, value: string) {
    return value ? ' ' + name : ''
}

function callFilter (ctx: CompileContext, name: string, args: any[]) {
    const filter = ctx.instance['filters'][name]
    if (typeof filter === 'function') {
        return filter.apply(ctx.instance, args)
    }
}

function defaultStyleFilter (source: object | string | string[]) {
    if (typeof source === 'object') {
        let result = ''
        for (const key in source) {
            /* istanbul ignore else  */
            if (source.hasOwnProperty(key)) {
                result += key + ':' + source[key] + ';'
            }
        }

        return result
    }

    return source
}

function createFromPrototype (proto: object) {
    function Creator () {}
    Creator.prototype = proto
    return new (Creator as any)()
}

export const _ = {
    escapeHTML, defaultStyleFilter, callFilter, boolAttrFilter, attrFilter, extend, contains, _classFilter, _styleFilter, _xstyleFilter, _xclassFilter, createFromPrototype
}
