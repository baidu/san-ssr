<?php $render = function ($data, $noDataOutput) {
function _id31($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id31Proto = [
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
"proto" => $_id31Proto,
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
$html .= San::escapeHTML((isset($componentCtx["data"]->{"text"}) ? $componentCtx["data"]->{"text"} : null));
$html .= "</b>";
return $html;
};
function _id30($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id30Proto = [
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
"proto" => $_id30Proto,
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
$html .= call_user_func("_id31", 
(object)["text" => (isset($componentCtx["data"]->{"text"}) ? $componentCtx["data"]->{"text"} : null)], true, $componentCtx, "x-label", $sourceSlots);
$sourceSlots = null;
$html .= "</div>";
return $html;
};
return call_user_func("_id30", $data, $noDataOutput);
}; ?>