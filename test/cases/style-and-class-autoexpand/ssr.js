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

componentRenderers._id303 = componentRenderers._id303|| _id303;
var _id303Proto = {
filters: {

},
computed: {

},
computedNames: [

],
tagName: "span"
};
function _id303(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id303Proto,
sourceSlots: sourceSlots,
data: data || {"styles":{"main":{"position":"fixed","display":"block"}},"classes":{"main":["ui","ui-label"]}},
owner: parentCtx,
slotRenderers: {}
};
if (data) {
componentCtx.data["styles"] = componentCtx.data["styles"] || {"main":{"position":"fixed","display":"block"}};
componentCtx.data["classes"] = componentCtx.data["classes"] || {"main":["ui","ui-label"]};
}
var computedNames = componentCtx.proto.computedNames;
for (var $i = 0; $i < computedNames.length; $i++) {
  var $computedName = computedNames[$i];
  data[$computedName] = componentCtx.proto.computed[$computedName](componentCtx);
}
html += "<span";
html += attrFilter("class", escapeHTML(_xclassFilter(componentCtx.data.class, escapeHTML(_classFilter(componentCtx.data.classes.main)))));
html += attrFilter("style", escapeHTML(_xstyleFilter(componentCtx.data.style, escapeHTML(_styleFilter(componentCtx.data.styles.main)))));
if (componentCtx.data.id) {
html += attrFilter("id", escapeHTML(componentCtx.data.id));
}
html += ">";
if (!noDataOutput) {
html += "<!--s-data:" + JSON.stringify(componentCtx.data) + "-->";
}
html += "label</span>";
return html;
};
componentRenderers._id302 = componentRenderers._id302|| _id302;
var _id302Proto = {
filters: {

},
computed: {

},
computedNames: [

],
tagName: "a"
};
function _id302(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id302Proto,
sourceSlots: sourceSlots,
data: data || {"styles":{"main":{"width":"50px","height":"50px"},"title":{"width":"50px","height":"20px"}},"classes":{"main":["app","main"],"title":["app-title","main-title"]}},
owner: parentCtx,
slotRenderers: {}
};
if (data) {
componentCtx.data["styles"] = componentCtx.data["styles"] || {"main":{"width":"50px","height":"50px"},"title":{"width":"50px","height":"20px"}};
componentCtx.data["classes"] = componentCtx.data["classes"] || {"main":["app","main"],"title":["app-title","main-title"]};
}
var computedNames = componentCtx.proto.computedNames;
for (var $i = 0; $i < computedNames.length; $i++) {
  var $computedName = computedNames[$i];
  data[$computedName] = componentCtx.proto.computed[$computedName](componentCtx);
}
html += "<a";
html += attrFilter("class", escapeHTML(_xclassFilter(componentCtx.data.class, escapeHTML(_classFilter(componentCtx.data.classes.main)))));
html += attrFilter("style", escapeHTML(_xstyleFilter(componentCtx.data.style, escapeHTML(_styleFilter(componentCtx.data.styles.main)))));
if (componentCtx.data.id) {
html += attrFilter("id", escapeHTML(componentCtx.data.id));
}
html += ">";
if (!noDataOutput) {
html += "<!--s-data:" + JSON.stringify(componentCtx.data) + "-->";
}
html += "<h3";
if (componentCtx.data.classes.title) {
html += attrFilter("class", escapeHTML(_classFilter(componentCtx.data.classes.title)));
}
if (componentCtx.data.styles.title) {
html += attrFilter("style", escapeHTML(_styleFilter(componentCtx.data.styles.title)));
}
html += "></h3>";
var $sourceSlots = [];
html += componentRenderers._id303(
{}, true, componentCtx, "ui-label", $sourceSlots);
$sourceSlots = null;
html += "</a>";
return html;
};
return componentRenderers._id302(data, noDataOutput)
}