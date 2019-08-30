<?php $render = function ($data, $noDataOutput) {
function _id75($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id75Proto = [
"filters" => [

],
"computed" => [

],
"computedNames" => [

],
"tagName" => "a"
];
$html = "";
$componentCtx = [
"proto" => $_id75Proto,
"sourceSlots" => $sourceSlots,
"data" => $data ? $data : (object)[],
"owner" => $parentCtx,
"slotRenderers" => []
];
if ($data) {
}
$computedNames = $componentCtx["proto"]["computedNames"];
foreach ($computedNames as $i => $computedName) {
  $data[$computedName] = $componentCtx["proto"]["computed"][$computedName]($componentCtx);
}
$html .= "<a";
if ((isset($componentCtx["data"]->{"class"}) ? $componentCtx["data"]->{"class"} : null)) {
$html .= San::attrFilter('class', San::escapeHTML(San::_classFilter((isset($componentCtx["data"]->{"class"}) ? $componentCtx["data"]->{"class"} : null))));
}
if ((isset($componentCtx["data"]->{"style"}) ? $componentCtx["data"]->{"style"} : null)) {
$html .= San::attrFilter('style', San::escapeHTML(San::_styleFilter((isset($componentCtx["data"]->{"style"}) ? $componentCtx["data"]->{"style"} : null))));
}
if ((isset($componentCtx["data"]->{"id"}) ? $componentCtx["data"]->{"id"} : null)) {
$html .= San::attrFilter('id', San::escapeHTML((isset($componentCtx["data"]->{"id"}) ? $componentCtx["data"]->{"id"} : null)));
}
$html .= ">";
if (!$noDataOutput) {
$html .= "<!--s-data:" . json_encode($componentCtx["data"], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "-->";
}
if (!isset($componentCtx["slotRenderers"]["_id76"])) $componentCtx["slotRenderers"]["_id76"] = function () use (&$componentCtx, &$html){
$defaultSlotRender = function ($componentCtx) {
  $html = "";
  return $html;
};
$isInserted = false;
$ctxSourceSlots = $componentCtx["sourceSlots"];
$mySourceSlots = [];
if (count($ctxSourceSlots) > 0 && !isset($ctxSourceSlots[0][1])) {
  array_push($mySourceSlots, $ctxSourceSlots[0][0]);
  $isInserted = true;
}
if (!$isInserted) { array_push($mySourceSlots, $defaultSlotRender); }
$slotCtx = $isInserted ? $componentCtx["owner"] : $componentCtx;
foreach ($mySourceSlots as $renderIndex => $slot) {
  $html .= $slot($slotCtx);
}
};
call_user_func($componentCtx["slotRenderers"]["_id76"]);
$html .= "</a>";
return $html;
};
function _id77($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id77Proto = [
"filters" => [

],
"computed" => [

],
"computedNames" => [

],
"tagName" => "b"
];
$html = "";
$componentCtx = [
"proto" => $_id77Proto,
"sourceSlots" => $sourceSlots,
"data" => $data ? $data : (object)[],
"owner" => $parentCtx,
"slotRenderers" => []
];
if ($data) {
}
$computedNames = $componentCtx["proto"]["computedNames"];
foreach ($computedNames as $i => $computedName) {
  $data[$computedName] = $componentCtx["proto"]["computed"][$computedName]($componentCtx);
}
$html .= "<b";
if ((isset($componentCtx["data"]->{"class"}) ? $componentCtx["data"]->{"class"} : null)) {
$html .= San::attrFilter('class', San::escapeHTML(San::_classFilter((isset($componentCtx["data"]->{"class"}) ? $componentCtx["data"]->{"class"} : null))));
}
if ((isset($componentCtx["data"]->{"style"}) ? $componentCtx["data"]->{"style"} : null)) {
$html .= San::attrFilter('style', San::escapeHTML(San::_styleFilter((isset($componentCtx["data"]->{"style"}) ? $componentCtx["data"]->{"style"} : null))));
}
if ((isset($componentCtx["data"]->{"id"}) ? $componentCtx["data"]->{"id"} : null)) {
$html .= San::attrFilter('id', San::escapeHTML((isset($componentCtx["data"]->{"id"}) ? $componentCtx["data"]->{"id"} : null)));
}
$html .= ">";
if (!$noDataOutput) {
$html .= "<!--s-data:" . json_encode($componentCtx["data"], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "-->";
}
if (!isset($componentCtx["slotRenderers"]["_id78"])) $componentCtx["slotRenderers"]["_id78"] = function () use (&$componentCtx, &$html){
$defaultSlotRender = function ($componentCtx) {
  $html = "";
  return $html;
};
$isInserted = false;
$ctxSourceSlots = $componentCtx["sourceSlots"];
$mySourceSlots = [];
if (count($ctxSourceSlots) > 0 && !isset($ctxSourceSlots[0][1])) {
  array_push($mySourceSlots, $ctxSourceSlots[0][0]);
  $isInserted = true;
}
if (!$isInserted) { array_push($mySourceSlots, $defaultSlotRender); }
$slotCtx = $isInserted ? $componentCtx["owner"] : $componentCtx;
foreach ($mySourceSlots as $renderIndex => $slot) {
  $html .= $slot($slotCtx);
}
};
call_user_func($componentCtx["slotRenderers"]["_id78"]);
$html .= "</b>";
return $html;
};
function _id74($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id74Proto = [
"filters" => [

],
"computed" => [

],
"computedNames" => [

],
"tagName" => "div"
];
$html = "";
$componentCtx = [
"proto" => $_id74Proto,
"sourceSlots" => $sourceSlots,
"data" => $data ? $data : (object)[],
"owner" => $parentCtx,
"slotRenderers" => []
];
if ($data) {
}
$computedNames = $componentCtx["proto"]["computedNames"];
foreach ($computedNames as $i => $computedName) {
  $data[$computedName] = $componentCtx["proto"]["computed"][$computedName]($componentCtx);
}
$html .= "<div";
if ((isset($componentCtx["data"]->{"class"}) ? $componentCtx["data"]->{"class"} : null)) {
$html .= San::attrFilter('class', San::escapeHTML(San::_classFilter((isset($componentCtx["data"]->{"class"}) ? $componentCtx["data"]->{"class"} : null))));
}
if ((isset($componentCtx["data"]->{"style"}) ? $componentCtx["data"]->{"style"} : null)) {
$html .= San::attrFilter('style', San::escapeHTML(San::_styleFilter((isset($componentCtx["data"]->{"style"}) ? $componentCtx["data"]->{"style"} : null))));
}
if ((isset($componentCtx["data"]->{"id"}) ? $componentCtx["data"]->{"id"} : null)) {
$html .= San::attrFilter('id', San::escapeHTML((isset($componentCtx["data"]->{"id"}) ? $componentCtx["data"]->{"id"} : null)));
}
$html .= ">";
if (!$noDataOutput) {
$html .= "<!--s-data:" . json_encode($componentCtx["data"], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "-->";
}
$sourceSlots = [];
array_push($sourceSlots, [function ($componentCtx) {
  $html = "";
$sourceSlots = [];
array_push($sourceSlots, [function ($componentCtx) {
  $html = "";
$html .= "Hello " . San::escapeHTML((isset($componentCtx["data"]->{"text"}) ? $componentCtx["data"]->{"text"} : null));
  return $html;
}]);
$html .= call_user_func("_id77", 
(object)[], true, $componentCtx, "x-label", $sourceSlots);
$sourceSlots = null;
  return $html;
}]);
$html .= call_user_func("_id75", 
(object)[], true, $componentCtx, "x-panel", $sourceSlots);
$sourceSlots = null;
$html .= "</div>";
return $html;
};
return call_user_func("_id74", $data, $noDataOutput);
}; ?>