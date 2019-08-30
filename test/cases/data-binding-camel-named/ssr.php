<?php $render = function ($data, $noDataOutput) {
function _id38($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id38Proto = [
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
"proto" => $_id38Proto,
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
$html .= "<span";
if ((isset($componentCtx["data"]->{"dataTitle"}) ? $componentCtx["data"]->{"dataTitle"} : null)) {
$html .= San::attrFilter('title', San::escapeHTML((isset($componentCtx["data"]->{"dataTitle"}) ? $componentCtx["data"]->{"dataTitle"} : null)));
}
$html .= ">";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"dataText"}) ? $componentCtx["data"]->{"dataText"} : null));
$html .= "</span></a>";
return $html;
};
function _id37($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id37Proto = [
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
"proto" => $_id37Proto,
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
$html .= call_user_func("_id38", 
(object)["dataTitle" => (isset($componentCtx["data"]->{"title"}) ? $componentCtx["data"]->{"title"} : null),
"dataText" => (isset($componentCtx["data"]->{"text"}) ? $componentCtx["data"]->{"text"} : null)], true, $componentCtx, "ui-label", $sourceSlots);
$sourceSlots = null;
$html .= "</div>";
return $html;
};
return call_user_func("_id37", $data, $noDataOutput);
}; ?>