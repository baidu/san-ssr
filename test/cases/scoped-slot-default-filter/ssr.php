<?php $render = function ($data, $noDataOutput) {
function _id202($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id202Proto = [
"filters" => [
"upper" => function ($source) {
    return $source["charAt"](0)["toUpperCase"]() + \Ts2Php_Helper::arraySlice($source, 1);
}
],
"computed" => [

],
"computedNames" => [

],
"tagName" => "div"
];
$html = "";
$componentCtx = [
"proto" => $_id202Proto,
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
if (!isset($componentCtx["slotRenderers"]["_id203"])) $componentCtx["slotRenderers"]["_id203"] = function () use (&$componentCtx, &$html){
$defaultSlotRender = function ($componentCtx) {
  $html = "";
$html .= "<p>";
$html .= San::escapeHTML(San::callFilter($componentCtx, "upper", [(isset($componentCtx["data"]->{"n"}) ? $componentCtx["data"]->{"n"} : null)])) . "," . San::escapeHTML(San::callFilter($componentCtx, "upper", [(isset($componentCtx["data"]->{"sex"}) ? $componentCtx["data"]->{"sex"} : null)])) . "," . San::escapeHTML(San::callFilter($componentCtx, "upper", [(isset($componentCtx["data"]->{"email"}) ? $componentCtx["data"]->{"email"} : null)]));
$html .= "</p>";

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
$slotCtx = ["data" => $slotCtx["data"], "proto" => $slotCtx["proto"], "owner" => $slotCtx["owner"]];
$slotCtx["data"]->n = (isset($componentCtx["data"]->{"data"}->{"name"}) ? $componentCtx["data"]->{"data"}->{"name"} : null);
$slotCtx["data"]->email = (isset($componentCtx["data"]->{"data"}->{"email"}) ? $componentCtx["data"]->{"data"}->{"email"} : null);
$slotCtx["data"]->sex = (isset($componentCtx["data"]->{"data"}->{"sex"}) ? $componentCtx["data"]->{"data"}->{"sex"} : null)?"male":"female";
foreach ($mySourceSlots as $renderIndex => $slot) {
  $html .= $slot($slotCtx);
}
};
call_user_func($componentCtx["slotRenderers"]["_id203"]);
$html .= "</div>";
return $html;
};
function _id201($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id201Proto = [
"filters" => [
"upper" => function ($source) {
    return $source["toUpperCase"]();
}
],
"computed" => [

],
"computedNames" => [

],
"tagName" => "div"
];
$html = "";
$componentCtx = [
"proto" => $_id201Proto,
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
$html .= call_user_func("_id202", 
(object)["data" => (isset($componentCtx["data"]->{"man"}) ? $componentCtx["data"]->{"man"} : null)], true, $componentCtx, "x-man", $sourceSlots);
$sourceSlots = null;
$html .= "</div>";
return $html;
};
return call_user_func("_id201", $data, $noDataOutput);
}; ?>