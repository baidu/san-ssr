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

componentRenderers._id1 = componentRenderers._id1|| _id1;
var _id1Proto = {
filters: {

},
computed: {
forms: function (componentCtx) {
            const cates = componentCtx.data.cates
            const formLen = componentCtx.data.formLen

            const result = {}
            if (cates instanceof Array) {
                let start = 1
                for (let i = 0; i < cates.length; i++) {
                    result[cates[i]] = []
                    for (let j = 0; j < formLen; j++) {
                        result[cates[i]].push(start++)
                    }
                }
            }

            return result
        }
},
computedNames: [
"forms"
],
tagName: "form"
};
function _id1(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id1Proto,
sourceSlots: sourceSlots,
data: data || {"formLen":3,"forms":{}},
owner: parentCtx,
slotRenderers: {}
};
if (data) {
componentCtx.data["formLen"] = componentCtx.data["formLen"] || 3;
componentCtx.data["forms"] = componentCtx.data["forms"] || {};
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
var _id3 = componentCtx.data.cates;
if (_id3 instanceof Array) {
for (var _id2 = 0; _id2 < _id3.length; _id2++) {
componentCtx.data._id2=_id2;
componentCtx.data.cate= _id3[_id2];
html += "<fieldset>";
var _id5 = componentCtx.data.forms[componentCtx.data.cate];
if (_id5 instanceof Array) {
for (var _id4 = 0; _id4 < _id5.length; _id4++) {
componentCtx.data._id4=_id4;
componentCtx.data.item= _id5[_id4];
html += "<label>";
html += escapeHTML(componentCtx.data.item);
html += "</label>";

}
} else if (typeof _id5 === "object") {
for (var _id4 in _id5) {
if (_id5[_id4] != null) {
componentCtx.data._id4=_id4;
componentCtx.data.item= _id5[_id4];
html += "<label>";
html += escapeHTML(componentCtx.data.item);
html += "</label>";

}
}
}
html += "</fieldset>";

}
} else if (typeof _id3 === "object") {
for (var _id2 in _id3) {
if (_id3[_id2] != null) {
componentCtx.data._id2=_id2;
componentCtx.data.cate= _id3[_id2];
html += "<fieldset>";
var _id7 = componentCtx.data.forms[componentCtx.data.cate];
if (_id7 instanceof Array) {
for (var _id6 = 0; _id6 < _id7.length; _id6++) {
componentCtx.data._id6=_id6;
componentCtx.data.item= _id7[_id6];
html += "<label>";
html += escapeHTML(componentCtx.data.item);
html += "</label>";

}
} else if (typeof _id7 === "object") {
for (var _id6 in _id7) {
if (_id7[_id6] != null) {
componentCtx.data._id6=_id6;
componentCtx.data.item= _id7[_id6];
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
return componentRenderers._id1(data, noDataOutput)
}