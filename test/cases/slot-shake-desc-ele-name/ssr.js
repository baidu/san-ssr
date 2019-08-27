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

componentRenderers._id286 = componentRenderers._id286|| _id286;
var _id286Proto = {
filters: {

},
computed: {

},
computedNames: [

],
tagName: "div"
};
function _id286(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id286Proto,
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
html += "    ";
var _id288 = componentCtx.data.columns;
if (_id288 instanceof Array) {
for (var _id287 = 0; _id287 < _id288.length; _id287++) {
componentCtx.data._id287=_id287;
componentCtx.data.col= _id288[_id287];
html += "<h3>";
html += escapeHTML(componentCtx.data.col.label);
html += "</h3>";

}
} else if (typeof _id288 === "object") {
for (var _id287 in _id288) {
if (_id288[_id287] != null) {
componentCtx.data._id287=_id287;
componentCtx.data.col= _id288[_id287];
html += "<h3>";
html += escapeHTML(componentCtx.data.col.label);
html += "</h3>";

}
}
}
html += "    ";
var _id290 = componentCtx.data.datasource;
if (_id290 instanceof Array) {
for (var _id289 = 0; _id289 < _id290.length; _id289++) {
componentCtx.data._id289=_id289;
componentCtx.data.row= _id290[_id289];
html += "<ul>      ";
var _id292 = componentCtx.data.columns;
if (_id292 instanceof Array) {
for (var _id291 = 0; _id291 < _id292.length; _id291++) {
componentCtx.data._id291=_id291;
componentCtx.data.col= _id292[_id291];
html += "<li>";
componentCtx.slotRenderers._id293 = componentCtx.slotRenderers._id293 || function () {
function $defaultSlotRender(componentCtx) {
  var html = "";
html += escapeHTML(componentCtx.data.row[componentCtx.data.col.name]);

  return html;
}
var $isInserted = false;
var $ctxSourceSlots = componentCtx.sourceSlots;
var $mySourceSlots = [];
var $slotName = "col-" + escapeHTML(componentCtx.data.col.name);
for (var $i = 0; $i < $ctxSourceSlots.length; $i++) {
  if ($ctxSourceSlots[$i][1] == $slotName) {
    $mySourceSlots.push($ctxSourceSlots[$i][0]);
    $isInserted = true;
  }
}
if (!$isInserted) { $mySourceSlots.push($defaultSlotRender); }
var $slotCtx = $isInserted ? componentCtx.owner : componentCtx;
$slotCtx = {data: extend({}, $slotCtx.data), proto: $slotCtx.proto, owner: $slotCtx.owner};
$slotCtx.data["row"] = componentCtx.data.row;
$slotCtx.data["col"] = componentCtx.data.col;
for (var $renderIndex = 0; $renderIndex < $mySourceSlots.length; $renderIndex++) {
  html += $mySourceSlots[$renderIndex]($slotCtx);
}
};
componentCtx.slotRenderers._id293();
html += "</li>";

}
} else if (typeof _id292 === "object") {
for (var _id291 in _id292) {
if (_id292[_id291] != null) {
componentCtx.data._id291=_id291;
componentCtx.data.col= _id292[_id291];
html += "<li>";
componentCtx.slotRenderers._id294 = componentCtx.slotRenderers._id294 || function () {
function $defaultSlotRender(componentCtx) {
  var html = "";
html += escapeHTML(componentCtx.data.row[componentCtx.data.col.name]);

  return html;
}
var $isInserted = false;
var $ctxSourceSlots = componentCtx.sourceSlots;
var $mySourceSlots = [];
var $slotName = "col-" + escapeHTML(componentCtx.data.col.name);
for (var $i = 0; $i < $ctxSourceSlots.length; $i++) {
  if ($ctxSourceSlots[$i][1] == $slotName) {
    $mySourceSlots.push($ctxSourceSlots[$i][0]);
    $isInserted = true;
  }
}
if (!$isInserted) { $mySourceSlots.push($defaultSlotRender); }
var $slotCtx = $isInserted ? componentCtx.owner : componentCtx;
$slotCtx = {data: extend({}, $slotCtx.data), proto: $slotCtx.proto, owner: $slotCtx.owner};
$slotCtx.data["row"] = componentCtx.data.row;
$slotCtx.data["col"] = componentCtx.data.col;
for (var $renderIndex = 0; $renderIndex < $mySourceSlots.length; $renderIndex++) {
  html += $mySourceSlots[$renderIndex]($slotCtx);
}
};
componentCtx.slotRenderers._id294();
html += "</li>";

}
}
}
html += "    </ul>";

}
} else if (typeof _id290 === "object") {
for (var _id289 in _id290) {
if (_id290[_id289] != null) {
componentCtx.data._id289=_id289;
componentCtx.data.row= _id290[_id289];
html += "<ul>      ";
var _id296 = componentCtx.data.columns;
if (_id296 instanceof Array) {
for (var _id295 = 0; _id295 < _id296.length; _id295++) {
componentCtx.data._id295=_id295;
componentCtx.data.col= _id296[_id295];
html += "<li>";
componentCtx.slotRenderers._id297 = componentCtx.slotRenderers._id297 || function () {
function $defaultSlotRender(componentCtx) {
  var html = "";
html += escapeHTML(componentCtx.data.row[componentCtx.data.col.name]);

  return html;
}
var $isInserted = false;
var $ctxSourceSlots = componentCtx.sourceSlots;
var $mySourceSlots = [];
var $slotName = "col-" + escapeHTML(componentCtx.data.col.name);
for (var $i = 0; $i < $ctxSourceSlots.length; $i++) {
  if ($ctxSourceSlots[$i][1] == $slotName) {
    $mySourceSlots.push($ctxSourceSlots[$i][0]);
    $isInserted = true;
  }
}
if (!$isInserted) { $mySourceSlots.push($defaultSlotRender); }
var $slotCtx = $isInserted ? componentCtx.owner : componentCtx;
$slotCtx = {data: extend({}, $slotCtx.data), proto: $slotCtx.proto, owner: $slotCtx.owner};
$slotCtx.data["row"] = componentCtx.data.row;
$slotCtx.data["col"] = componentCtx.data.col;
for (var $renderIndex = 0; $renderIndex < $mySourceSlots.length; $renderIndex++) {
  html += $mySourceSlots[$renderIndex]($slotCtx);
}
};
componentCtx.slotRenderers._id297();
html += "</li>";

}
} else if (typeof _id296 === "object") {
for (var _id295 in _id296) {
if (_id296[_id295] != null) {
componentCtx.data._id295=_id295;
componentCtx.data.col= _id296[_id295];
html += "<li>";
componentCtx.slotRenderers._id298 = componentCtx.slotRenderers._id298 || function () {
function $defaultSlotRender(componentCtx) {
  var html = "";
html += escapeHTML(componentCtx.data.row[componentCtx.data.col.name]);

  return html;
}
var $isInserted = false;
var $ctxSourceSlots = componentCtx.sourceSlots;
var $mySourceSlots = [];
var $slotName = "col-" + escapeHTML(componentCtx.data.col.name);
for (var $i = 0; $i < $ctxSourceSlots.length; $i++) {
  if ($ctxSourceSlots[$i][1] == $slotName) {
    $mySourceSlots.push($ctxSourceSlots[$i][0]);
    $isInserted = true;
  }
}
if (!$isInserted) { $mySourceSlots.push($defaultSlotRender); }
var $slotCtx = $isInserted ? componentCtx.owner : componentCtx;
$slotCtx = {data: extend({}, $slotCtx.data), proto: $slotCtx.proto, owner: $slotCtx.owner};
$slotCtx.data["row"] = componentCtx.data.row;
$slotCtx.data["col"] = componentCtx.data.col;
for (var $renderIndex = 0; $renderIndex < $mySourceSlots.length; $renderIndex++) {
  html += $mySourceSlots[$renderIndex]($slotCtx);
}
};
componentCtx.slotRenderers._id298();
html += "</li>";

}
}
}
html += "    </ul>";

}
}
}
html += "</div>";
return html;
};
componentRenderers._id285 = componentRenderers._id285|| _id285;
var _id285Proto = {
filters: {

},
computed: {

},
computedNames: [

],
tagName: "div"
};
function _id285(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id285Proto,
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
var _id300 = componentCtx.data.deps;
if (_id300 instanceof Array) {
for (var _id299 = 0; _id299 < _id300.length; _id299++) {
componentCtx.data._id299=_id299;
componentCtx.data.dep= _id300[_id299];
var $sourceSlots = [];
$sourceSlots.push([function (componentCtx) {
  var html = "";
html += "<b>";
html += escapeHTML(componentCtx.data.row[componentCtx.data.col.name]);
html += "</b>";

  return html;
}, "col-" + escapeHTML(componentCtx.data.dep.strong)]);
html += componentRenderers._id286(
{"columns":componentCtx.data.dep.columns,
"datasource":componentCtx.data.dep.members}, true, componentCtx, "x-table", $sourceSlots);
$sourceSlots = null;

}
} else if (typeof _id300 === "object") {
for (var _id299 in _id300) {
if (_id300[_id299] != null) {
componentCtx.data._id299=_id299;
componentCtx.data.dep= _id300[_id299];
var $sourceSlots = [];
$sourceSlots.push([function (componentCtx) {
  var html = "";
html += "<b>";
html += escapeHTML(componentCtx.data.row[componentCtx.data.col.name]);
html += "</b>";

  return html;
}, "col-" + escapeHTML(componentCtx.data.dep.strong)]);
html += componentRenderers._id286(
{"columns":componentCtx.data.dep.columns,
"datasource":componentCtx.data.dep.members}, true, componentCtx, "x-table", $sourceSlots);
$sourceSlots = null;

}
}
}
html += "</div>";
return html;
};
return componentRenderers._id285(data, noDataOutput)
}