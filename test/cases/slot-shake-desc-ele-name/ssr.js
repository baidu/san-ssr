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

componentRenderers._id2 = componentRenderers._id2|| _id2;
var _id2Proto = {
filters: {

},
computed: {

},
computedNames: [

],
tagName: "div"
};
function _id2(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id2Proto,
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
var _id4 = componentCtx.data.columns;
if (_id4 instanceof Array) {
for (var _id3 = 0; _id3 < _id4.length; _id3++) {
componentCtx.data._id3=_id3;
componentCtx.data.col= _id4[_id3];
html += "<h3>";
html += escapeHTML(componentCtx.data.col.label);
html += "</h3>";

}
} else if (typeof _id4 === "object") {
for (var _id3 in _id4) {
if (_id4[_id3] != null) {
componentCtx.data._id3=_id3;
componentCtx.data.col= _id4[_id3];
html += "<h3>";
html += escapeHTML(componentCtx.data.col.label);
html += "</h3>";

}
}
}
html += "    ";
var _id6 = componentCtx.data.datasource;
if (_id6 instanceof Array) {
for (var _id5 = 0; _id5 < _id6.length; _id5++) {
componentCtx.data._id5=_id5;
componentCtx.data.row= _id6[_id5];
html += "<ul>      ";
var _id8 = componentCtx.data.columns;
if (_id8 instanceof Array) {
for (var _id7 = 0; _id7 < _id8.length; _id7++) {
componentCtx.data._id7=_id7;
componentCtx.data.col= _id8[_id7];
html += "<li>";
componentCtx.slotRenderers._id9 = componentCtx.slotRenderers._id9 || function () {
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
componentCtx.slotRenderers._id9();
html += "</li>";

}
} else if (typeof _id8 === "object") {
for (var _id7 in _id8) {
if (_id8[_id7] != null) {
componentCtx.data._id7=_id7;
componentCtx.data.col= _id8[_id7];
html += "<li>";
componentCtx.slotRenderers._id10 = componentCtx.slotRenderers._id10 || function () {
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
componentCtx.slotRenderers._id10();
html += "</li>";

}
}
}
html += "    </ul>";

}
} else if (typeof _id6 === "object") {
for (var _id5 in _id6) {
if (_id6[_id5] != null) {
componentCtx.data._id5=_id5;
componentCtx.data.row= _id6[_id5];
html += "<ul>      ";
var _id12 = componentCtx.data.columns;
if (_id12 instanceof Array) {
for (var _id11 = 0; _id11 < _id12.length; _id11++) {
componentCtx.data._id11=_id11;
componentCtx.data.col= _id12[_id11];
html += "<li>";
componentCtx.slotRenderers._id13 = componentCtx.slotRenderers._id13 || function () {
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
componentCtx.slotRenderers._id13();
html += "</li>";

}
} else if (typeof _id12 === "object") {
for (var _id11 in _id12) {
if (_id12[_id11] != null) {
componentCtx.data._id11=_id11;
componentCtx.data.col= _id12[_id11];
html += "<li>";
componentCtx.slotRenderers._id14 = componentCtx.slotRenderers._id14 || function () {
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
componentCtx.slotRenderers._id14();
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
componentRenderers._id1 = componentRenderers._id1|| _id1;
var _id1Proto = {
filters: {

},
computed: {

},
computedNames: [

],
tagName: "div"
};
function _id1(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id1Proto,
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
var _id16 = componentCtx.data.deps;
if (_id16 instanceof Array) {
for (var _id15 = 0; _id15 < _id16.length; _id15++) {
componentCtx.data._id15=_id15;
componentCtx.data.dep= _id16[_id15];
var $sourceSlots = [];
$sourceSlots.push([function (componentCtx) {
  var html = "";
html += "<b>";
html += escapeHTML(componentCtx.data.row[componentCtx.data.col.name]);
html += "</b>";

  return html;
}, "col-" + escapeHTML(componentCtx.data.dep.strong)]);
html += componentRenderers._id2(
{"columns":componentCtx.data.dep.columns,
"datasource":componentCtx.data.dep.members}, true, componentCtx, "x-table", $sourceSlots);
$sourceSlots = null;

}
} else if (typeof _id16 === "object") {
for (var _id15 in _id16) {
if (_id16[_id15] != null) {
componentCtx.data._id15=_id15;
componentCtx.data.dep= _id16[_id15];
var $sourceSlots = [];
$sourceSlots.push([function (componentCtx) {
  var html = "";
html += "<b>";
html += escapeHTML(componentCtx.data.row[componentCtx.data.col.name]);
html += "</b>";

  return html;
}, "col-" + escapeHTML(componentCtx.data.dep.strong)]);
html += componentRenderers._id2(
{"columns":componentCtx.data.dep.columns,
"datasource":componentCtx.data.dep.members}, true, componentCtx, "x-table", $sourceSlots);
$sourceSlots = null;

}
}
}
html += "</div>";
return html;
};
return componentRenderers._id1(data, noDataOutput)
}