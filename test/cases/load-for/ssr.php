<?php $render = function ($data, $noDataOutput) {
function _id271($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id271Proto = [
"filters" => [

],
"computed" => [

],
"computedNames" => [

],
"tagName" => "li"
];
$html = "";
$componentCtx = [
"proto" => $_id271Proto,
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
$html .= "<li";
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
if (!isset($componentCtx["slotRenderers"]["_id272"])) $componentCtx["slotRenderers"]["_id272"] = function () use (&$componentCtx, &$html){
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
call_user_func($componentCtx["slotRenderers"]["_id272"]);
$html .= "</li>";
return $html;
};
function _id270($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id270Proto = [
"filters" => [

],
"computed" => [

],
"computedNames" => [

],
"tagName" => "ul"
];
$html = "";
$componentCtx = [
"proto" => $_id270Proto,
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
$html .= "<ul";
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
$_id274 = (isset($componentCtx["data"]->{"list"}) ? $componentCtx["data"]->{"list"} : null);
if (is_array($_id274) || is_object($_id274)) {
foreach ($_id274 as $_id273 => $value) {
$componentCtx["data"]->_id273 = $_id273;
$componentCtx["data"]->item = $value;
$sourceSlots = [];
array_push($sourceSlots, [function ($componentCtx) {
  $html = "";
$html .= "Hello " . San::escapeHTML((isset($componentCtx["data"]->{"item"}) ? $componentCtx["data"]->{"item"} : null));
  return $html;
}]);
$html .= call_user_func("_id271", 
(object)[], true, $componentCtx, "x-li", $sourceSlots);
$sourceSlots = null;

}
}
$html .= "</ul>";
return $html;
};
return call_user_func("_id270", $data, $noDataOutput);
}; ?>