module.exports = function (data, noDataOutput) {
/* eslint no-unused-vars: "off" */
const $version = '3.7.7'

const componentRenderers = {}

function extend (target, source) {
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

function each (array, iterator) {
    if (array && array.length > 0) {
        for (let i = 0, l = array.length; i < l; i++) {
            if (iterator(array[i], i) === false) {
                break
            }
        }
    }
}

function contains (array, value) {
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

function htmlFilterReplacer (c) {
    return HTML_ENTITY[c]
}

function escapeHTML (source) {
    if (source == null) {
        return ''
    }

    if (typeof source === 'string') {
        return source ? source.replace(/[&<>"']/g, htmlFilterReplacer) : ''
    }

    return '' + source
}

function _classFilter (source) {
    if (source instanceof Array) {
        return source.join(' ')
    }

    return source
}

function _styleFilter (source) {
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

function _xclassFilter (outer, inner) {
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

function _xstyleFilter (outer, inner) {
    outer = outer && defaultStyleFilter(outer)
    if (outer) {
        if (inner) {
            return inner + ';' + outer
        }

        return outer
    }

    return inner
}

function attrFilter (name, value) {
    if (value) {
        return ' ' + name + '="' + value + '"'
    }

    return ''
}

function boolAttrFilter (name, value) {
    if (value && value !== 'false' && value !== '0') {
        return ' ' + name
    }

    return ''
}

function callFilter (ctx, name, args) {
    const filter = ctx.proto.filters[name]
    if (typeof filter === 'function') {
        return filter.apply(ctx, args)
    }
}

function defaultStyleFilter (source) {
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

componentRenderers._id318 = componentRenderers._id318|| _id318;
var _id318Proto = {
filters: {

},
computed: {

},
computedNames: [

],
tagName: "span"
};
function _id318(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id318Proto,
sourceSlots: sourceSlots,
data: data || {"title":"title","text":"text"},
owner: parentCtx,
slotRenderers: {}
};
if (data) {
componentCtx.data["title"] = componentCtx.data["title"] || "title";
componentCtx.data["text"] = componentCtx.data["text"] || "text";
}
var computedNames = componentCtx.proto.computedNames;
for (var $i = 0; $i < computedNames.length; $i++) {
  var $computedName = computedNames[$i];
  data[$computedName] = componentCtx.proto.computed[$computedName](componentCtx);
}
html += "<span";
if (componentCtx.data.title) {
html += attrFilter("title", escapeHTML(componentCtx.data.title));
}
html += attrFilter("class", escapeHTML(_xclassFilter(componentCtx.data.class, "label")));
if (componentCtx.data.style) {
html += attrFilter("style", escapeHTML(_styleFilter(componentCtx.data.style)));
}
if (componentCtx.data.id) {
html += attrFilter("id", escapeHTML(componentCtx.data.id));
}
html += ">";
if (!noDataOutput) {
html += "<!--s-data:" + JSON.stringify(componentCtx.data) + "-->";
}
html += escapeHTML(componentCtx.data.text);
html += "</span>";
return html;
};
componentRenderers._id317 = componentRenderers._id317|| _id317;
var _id317Proto = {
filters: {

},
computed: {

},
computedNames: [

],
tagName: "div"
};
function _id317(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id317Proto,
sourceSlots: sourceSlots,
data: data || {"jokeName":"airike","school":"none"},
owner: parentCtx,
slotRenderers: {}
};
if (data) {
componentCtx.data["jokeName"] = componentCtx.data["jokeName"] || "airike";
componentCtx.data["school"] = componentCtx.data["school"] || "none";
}
var computedNames = componentCtx.proto.computedNames;
for (var $i = 0; $i < computedNames.length; $i++) {
  var $computedName = computedNames[$i];
  data[$computedName] = componentCtx.proto.computed[$computedName](componentCtx);
}
html += "<div";
if (componentCtx.data.class) {
html += attrFilter("class", escapeHTML(_classFilter(componentCtx.data.class)));
}
if (componentCtx.data.style) {
html += attrFilter("style", escapeHTML(_styleFilter(componentCtx.data.style)));
}
if (componentCtx.data.id) {
html += attrFilter("id", escapeHTML(componentCtx.data.id));
}
html += ">";
if (!noDataOutput) {
html += "<!--s-data:" + JSON.stringify(componentCtx.data) + "-->";
}
html += "<h5>";
var $sourceSlots = [];
html += componentRenderers._id318(
{"text":componentCtx.data.jokeName,
"class":escapeHTML(_classFilter(componentCtx.data.labelClass)) + " my-label"}, true, componentCtx, "ui-label", $sourceSlots);
$sourceSlots = null;
html += "</h5><p><a";
if (componentCtx.data.school) {
html += attrFilter("title", escapeHTML(componentCtx.data.school));
}
html += ">";
html += escapeHTML(componentCtx.data.school);
html += "</a><u";
if (componentCtx.data.company) {
html += attrFilter("title", escapeHTML(componentCtx.data.company));
}
html += ">";
html += escapeHTML(componentCtx.data.company);
html += "</u></p></div>";
return html;
};
return componentRenderers._id317(data, noDataOutput)
}