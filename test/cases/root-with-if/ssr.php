<?php $render = function ($data, $noDataOutput) {
function _id220($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id220Proto = [
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
"proto" => $_id220Proto,
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
if ((isset($componentCtx["data"]->{"person"}) ? $componentCtx["data"]->{"person"} : null)) {
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
$html .= San::escapeHTML((isset($componentCtx["data"]->{"person"}->{"name"}) ? $componentCtx["data"]->{"person"}->{"name"} : null));
$html .= "</b>";
}
return $html;
};
function _id219($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id219Proto = [
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
"proto" => $_id219Proto,
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
$html .= call_user_func("_id220", 
(object)["person" => (isset($componentCtx["data"]->{"p"}) ? $componentCtx["data"]->{"p"} : null)], true, $componentCtx, "x-child", $sourceSlots);
$sourceSlots = null;
$html .= "</div>";
return $html;
};
return call_user_func("_id219", $data, $noDataOutput);
}; ?>