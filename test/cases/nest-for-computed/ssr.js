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

componentRenderers._id194 = componentRenderers._id194|| _id194;
var _id194Proto = {
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
function _id194(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id194Proto,
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
var _id196 = componentCtx.data.cates;
if (_id196 instanceof Array) {
for (var _id195 = 0; _id195 < _id196.length; _id195++) {
componentCtx.data._id195=_id195;
componentCtx.data.cate= _id196[_id195];
html += "<fieldset>";
var _id198 = componentCtx.data.forms[componentCtx.data.cate];
if (_id198 instanceof Array) {
for (var _id197 = 0; _id197 < _id198.length; _id197++) {
componentCtx.data._id197=_id197;
componentCtx.data.item= _id198[_id197];
html += "<label>";
html += escapeHTML(componentCtx.data.item);
html += "</label>";

}
} else if (typeof _id198 === "object") {
for (var _id197 in _id198) {
if (_id198[_id197] != null) {
componentCtx.data._id197=_id197;
componentCtx.data.item= _id198[_id197];
html += "<label>";
html += escapeHTML(componentCtx.data.item);
html += "</label>";

}
}
}
html += "</fieldset>";

}
} else if (typeof _id196 === "object") {
for (var _id195 in _id196) {
if (_id196[_id195] != null) {
componentCtx.data._id195=_id195;
componentCtx.data.cate= _id196[_id195];
html += "<fieldset>";
var _id200 = componentCtx.data.forms[componentCtx.data.cate];
if (_id200 instanceof Array) {
for (var _id199 = 0; _id199 < _id200.length; _id199++) {
componentCtx.data._id199=_id199;
componentCtx.data.item= _id200[_id199];
html += "<label>";
html += escapeHTML(componentCtx.data.item);
html += "</label>";

}
} else if (typeof _id200 === "object") {
for (var _id199 in _id200) {
if (_id200[_id199] != null) {
componentCtx.data._id199=_id199;
componentCtx.data.item= _id200[_id199];
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
return componentRenderers._id194(data, noDataOutput)
}