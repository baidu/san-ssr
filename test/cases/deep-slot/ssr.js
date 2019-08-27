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

componentRenderers._id85 = componentRenderers._id85|| _id85;
var _id85Proto = {
filters: {

},
computed: {

},
computedNames: [

],
tagName: "div"
};
function _id85(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id85Proto,
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
componentCtx.slotRenderers._id86 = componentCtx.slotRenderers._id86 || function () {
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
componentCtx.slotRenderers._id86();
html += "</div>";
return html;
};
componentRenderers._id87 = componentRenderers._id87|| _id87;
var _id87Proto = {
toggle: function () {
        const hidden = this.data.get('hidden')
        this.data.set('hidden', !hidden)
    },
filters: {

},
computed: {

},
computedNames: [

],
tagName: "div"
};
function _id87(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id87Proto,
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
html += "<h3>";
componentCtx.slotRenderers._id88 = componentCtx.slotRenderers._id88 || function () {
function $defaultSlotRender(componentCtx) {
  var html = "";
  return html;
}
var $isInserted = false;
var $ctxSourceSlots = componentCtx.sourceSlots;
var $mySourceSlots = [];
var $slotName = "title";
for (var $i = 0; $i < $ctxSourceSlots.length; $i++) {
  if ($ctxSourceSlots[$i][1] == $slotName) {
    $mySourceSlots.push($ctxSourceSlots[$i][0]);
    $isInserted = true;
  }
}
if (!$isInserted) { $mySourceSlots.push($defaultSlotRender); }
var $slotCtx = $isInserted ? componentCtx.owner : componentCtx;
for (var $renderIndex = 0; $renderIndex < $mySourceSlots.length; $renderIndex++) {
  html += $mySourceSlots[$renderIndex]($slotCtx);
}
};
componentCtx.slotRenderers._id88();
html += "</h3>";
if (!componentCtx.data.hidden) {
componentCtx.slotRenderers._id89 = componentCtx.slotRenderers._id89 || function () {
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
componentCtx.slotRenderers._id89();

}
html += "</div>";
return html;
};
componentRenderers._id90 = componentRenderers._id90|| _id90;
var _id90Proto = {
filters: {

},
computed: {

},
computedNames: [

],
tagName: "div"
};
function _id90(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id90Proto,
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
html += "<a>";
componentCtx.slotRenderers._id91 = componentCtx.slotRenderers._id91 || function () {
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
componentCtx.slotRenderers._id91();
html += "</a></div>";
return html;
};
componentRenderers._id84 = componentRenderers._id84|| _id84;
var _id84Proto = {
filters: {

},
computed: {

},
computedNames: [

],
tagName: "div"
};
function _id84(data, noDataOutput, parentCtx, tagName, sourceSlots) {
var html = "";
var componentCtx = {
proto: _id84Proto,
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
html += "<u>";
html += escapeHTML(componentCtx.data.name);
html += "</u>";
var $sourceSlots = [];
$sourceSlots.push([function (componentCtx) {
  var html = "";
html += escapeHTML(componentCtx.data.closeText);
  return html;
}]);
html += componentRenderers._id90(
{}, true, componentCtx, "x-button", $sourceSlots);
$sourceSlots = null;
  return html;
}]);
html += componentRenderers._id85(
{}, true, componentCtx, "x-panel", $sourceSlots);
$sourceSlots = null;
  return html;
}]);
$sourceSlots.push([function (componentCtx) {
  var html = "";
html += "<b>";
html += escapeHTML(componentCtx.data.title);
html += "</b>";

  return html;
}, "title"]);
html += componentRenderers._id87(
{"hidden":componentCtx.data.folderHidden}, true, componentCtx, "x-folder", $sourceSlots);
$sourceSlots = null;
html += "</div>";
return html;
};
return componentRenderers._id84(data, noDataOutput)
}