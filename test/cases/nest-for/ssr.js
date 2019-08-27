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

componentRenderers._id186 = componentRenderers._id186|| _id186;
var _id186Proto = {
filters: {

},
computed: {

},
computedNames: [

],
tagName: "form"
};
function _id186(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id186Proto,
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
html += "<form";
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
var _id188 = componentCtx.data.cates;
if (_id188 instanceof Array) {
for (var _id187 = 0; _id187 < _id188.length; _id187++) {
componentCtx.data._id187=_id187;
componentCtx.data.cate= _id188[_id187];
html += "<fieldset>";
var _id190 = componentCtx.data.forms[componentCtx.data.cate];
if (_id190 instanceof Array) {
for (var _id189 = 0; _id189 < _id190.length; _id189++) {
componentCtx.data._id189=_id189;
componentCtx.data.item= _id190[_id189];
html += "<label>";
html += escapeHTML(componentCtx.data.item);
html += "</label>";

}
} else if (typeof _id190 === "object") {
for (var _id189 in _id190) {
if (_id190[_id189] != null) {
componentCtx.data._id189=_id189;
componentCtx.data.item= _id190[_id189];
html += "<label>";
html += escapeHTML(componentCtx.data.item);
html += "</label>";

}
}
}
html += "</fieldset>";

}
} else if (typeof _id188 === "object") {
for (var _id187 in _id188) {
if (_id188[_id187] != null) {
componentCtx.data._id187=_id187;
componentCtx.data.cate= _id188[_id187];
html += "<fieldset>";
var _id192 = componentCtx.data.forms[componentCtx.data.cate];
if (_id192 instanceof Array) {
for (var _id191 = 0; _id191 < _id192.length; _id191++) {
componentCtx.data._id191=_id191;
componentCtx.data.item= _id192[_id191];
html += "<label>";
html += escapeHTML(componentCtx.data.item);
html += "</label>";

}
} else if (typeof _id192 === "object") {
for (var _id191 in _id192) {
if (_id192[_id191] != null) {
componentCtx.data._id191=_id191;
componentCtx.data.item= _id192[_id191];
html += "<label>";
html += escapeHTML(componentCtx.data.item);
html += "</label>";

}
}
}
html += "</fieldset>";

}
}
}
html += "</form>";
return html;
};
return componentRenderers._id186(data, noDataOutput)
}