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

componentRenderers._id169 = componentRenderers._id169|| _id169;
var _id169Proto = {
filters: {

},
computed: {

},
computedNames: [

],
tagName: "a"
};
function _id169(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id169Proto,
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
html += "<a";
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
componentCtx.slotRenderers._id170 = componentCtx.slotRenderers._id170 || function () {
function $defaultSlotRender(componentCtx) {
  var html = "";
  return html;
}
var $isInserted = false;
var $ctxSourceSlots = componentCtx.sourceSlots;
var $mySourceSlots = [];
if ($ctxSourceSlots[0] && $ctxSourceSlots[0][1] == null) {
  $mySourceSlots.push($ctxSourceSlots[0][0]);
  $isInserted = true;
}
if (!$isInserted) { $mySourceSlots.push($defaultSlotRender); }
var $slotCtx = $isInserted ? componentCtx.owner : componentCtx;
for (var $renderIndex = 0; $renderIndex < $mySourceSlots.length; $renderIndex++) {
  html += $mySourceSlots[$renderIndex]($slotCtx);
}
};
componentCtx.slotRenderers._id170();
html += "</a>";
return html;
};
componentRenderers._id171 = componentRenderers._id171|| _id171;
var _id171Proto = {
filters: {

},
computed: {

},
computedNames: [

],
tagName: "b"
};
function _id171(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id171Proto,
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
html += "<b";
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
componentCtx.slotRenderers._id172 = componentCtx.slotRenderers._id172 || function () {
function $defaultSlotRender(componentCtx) {
  var html = "";
  return html;
}
var $isInserted = false;
var $ctxSourceSlots = componentCtx.sourceSlots;
var $mySourceSlots = [];
if ($ctxSourceSlots[0] && $ctxSourceSlots[0][1] == null) {
  $mySourceSlots.push($ctxSourceSlots[0][0]);
  $isInserted = true;
}
if (!$isInserted) { $mySourceSlots.push($defaultSlotRender); }
var $slotCtx = $isInserted ? componentCtx.owner : componentCtx;
for (var $renderIndex = 0; $renderIndex < $mySourceSlots.length; $renderIndex++) {
  html += $mySourceSlots[$renderIndex]($slotCtx);
}
};
componentCtx.slotRenderers._id172();
html += "</b>";
return html;
};
componentRenderers._id168 = componentRenderers._id168|| _id168;
var _id168Proto = {
filters: {

},
computed: {

},
computedNames: [

],
tagName: "div"
};
function _id168(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id168Proto,
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
var $sourceSlots = [];
$sourceSlots.push([function (componentCtx) {
  var html = "";
var $sourceSlots = [];
$sourceSlots.push([function (componentCtx) {
  var html = "";
html += "Hello " + escapeHTML(componentCtx.data.text);
  return html;
}]);
html += componentRenderers._id171(
{}, true, componentCtx, "x-label", $sourceSlots);
$sourceSlots = null;
  return html;
}]);
html += componentRenderers._id169(
{}, true, componentCtx, "x-panel", $sourceSlots);
$sourceSlots = null;
html += "</div>";
return html;
};
return componentRenderers._id168(data, noDataOutput)
}