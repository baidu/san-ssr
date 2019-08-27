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

componentRenderers._id48 = componentRenderers._id48|| _id48;
var _id48Proto = {
filters: {

},
computed: {

},
computedNames: [

],
tagName: "ul"
};
function _id48(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id48Proto,
sourceSlots: sourceSlots,
data: data || {},
owner: parentCtx,
slotRenderers: {}
};
if (data) {
}
var computedNames = componentCtx.proto.computedNames;
for (var $i = 0; $i < computedNames.length; $i++) {
  var $computedName = computedNames[$i];
  data[$computedName] = componentCtx.proto.computed[$computedName](componentCtx);
}
html += "<ul";
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
var _id50 = componentCtx.data.list;
if (_id50 instanceof Array) {
for (var _id49 = 0; _id49 < _id50.length; _id49++) {
componentCtx.data._id49=_id49;
componentCtx.data.item= _id50[_id49];
html += "<li";
if (componentCtx.data.item) {
html += attrFilter("title", escapeHTML(componentCtx.data.item));
}
html += ">";
html += escapeHTML(componentCtx.data.item);
html += "</li>";

}
} else if (typeof _id50 === "object") {
for (var _id49 in _id50) {
if (_id50[_id49] != null) {
componentCtx.data._id49=_id49;
componentCtx.data.item= _id50[_id49];
html += "<li";
if (componentCtx.data.item) {
html += attrFilter("title", escapeHTML(componentCtx.data.item));
}
html += ">";
html += escapeHTML(componentCtx.data.item);
html += "</li>";

}
}
}
html += "</ul>";
return html;
};
componentRenderers._id47 = componentRenderers._id47|| _id47;
var _id47Proto = {
filters: {

},
computed: {

},
computedNames: [

],
tagName: "div"
};
function _id47(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id47Proto,
sourceSlots: sourceSlots,
data: data || {},
owner: parentCtx,
slotRenderers: {}
};
if (data) {
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
var _id52 = componentCtx.data.list;
if (_id52 instanceof Array) {
for (var _id51 = 0; _id51 < _id52.length; _id51++) {
componentCtx.data._id51=_id51;
componentCtx.data.item= _id52[_id51];
html += "<dl><dt";
if (componentCtx.data.item.name) {
html += attrFilter("title", escapeHTML(componentCtx.data.item.name));
}
html += ">";
html += escapeHTML(componentCtx.data.item.name);
html += "</dt><dd>";
var $sourceSlots = [];
html += componentRenderers._id48(
{"list":componentCtx.data.item.tels}, true, componentCtx, "ui-tel", $sourceSlots);
$sourceSlots = null;
html += "</dd></dl>";

}
} else if (typeof _id52 === "object") {
for (var _id51 in _id52) {
if (_id52[_id51] != null) {
componentCtx.data._id51=_id51;
componentCtx.data.item= _id52[_id51];
html += "<dl><dt";
if (componentCtx.data.item.name) {
html += attrFilter("title", escapeHTML(componentCtx.data.item.name));
}
html += ">";
html += escapeHTML(componentCtx.data.item.name);
html += "</dt><dd>";
var $sourceSlots = [];
html += componentRenderers._id48(
{"list":componentCtx.data.item.tels}, true, componentCtx, "ui-tel", $sourceSlots);
$sourceSlots = null;
html += "</dd></dl>";

}
}
}
html += "</div>";
return html;
};
componentRenderers._id46 = componentRenderers._id46|| _id46;
var _id46Proto = {
filters: {

},
computed: {

},
computedNames: [

],
tagName: "div"
};
function _id46(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id46Proto,
sourceSlots: sourceSlots,
data: data || {},
owner: parentCtx,
slotRenderers: {}
};
if (data) {
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
if (componentCtx.data.cond) {
var $sourceSlots = [];
html += componentRenderers._id47(
{"list":componentCtx.data.persons}, true, componentCtx, "ui-person", $sourceSlots);
$sourceSlots = null;

}
html += "</div>";
return html;
};
return componentRenderers._id46(data, noDataOutput)
}