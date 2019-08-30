<?php $render = function ($data, $noDataOutput) {
function _id81($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id81Proto = [
"filters" => [

],
"computed" => [

],
"computedNames" => [

],
"tagName" => "span"
];
$html = "";
$componentCtx = [
"proto" => $_id81Proto,
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
$html .= "<span";
if ((isset($componentCtx["data"]->{"text"}) ? $componentCtx["data"]->{"text"} : null)) {
$html .= San::attrFilter('title', San::escapeHTML((isset($componentCtx["data"]->{"text"}) ? $componentCtx["data"]->{"text"} : null)));
}
$html .= San::attrFilter('class', San::escapeHTML(San::_xclassFilter((isset($componentCtx["data"]->{"class"}) ? $componentCtx["data"]->{"class"} : null), "label")));
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
$html .= "</span>";
return $html;
};
function _id80($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id80Proto = [
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
"proto" => $_id80Proto,
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
$html .= "<h5>";
$sourceSlots = [];
$html .= call_user_func("_id81", 
(object)["text" => (isset($componentCtx["data"]->{"jokeName"}) ? $componentCtx["data"]->{"jokeName"} : null),
"class" => San::escapeHTML(San::_classFilter((isset($componentCtx["data"]->{"labelClass"}) ? $componentCtx["data"]->{"labelClass"} : null))) . " my-label"], true, $componentCtx, "ui-label", $sourceSlots);
$sourceSlots = null;
$html .= "</h5><p><a>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"school"}) ? $componentCtx["data"]->{"school"} : null));
$html .= "</a><u>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"company"}) ? $componentCtx["data"]->{"company"} : null));
$html .= "</u></p></div>";
return $html;
};
return call_user_func("_id80", $data, $noDataOutput);
}; ?>