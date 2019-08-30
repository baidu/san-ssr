<?php $render = function ($data, $noDataOutput) {
function _id53($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id53Proto = [
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
"proto" => $_id53Proto,
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
if ((isset($componentCtx["data"]->{"title"}) ? $componentCtx["data"]->{"title"} : null)) {
$html .= San::attrFilter('title', San::escapeHTML((isset($componentCtx["data"]->{"title"}) ? $componentCtx["data"]->{"title"} : null)));
}
$html .= ">";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"text"}) ? $componentCtx["data"]->{"text"} : null));
$html .= "</span></a>";
return $html;
};
function _id52($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id52Proto = [
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
"proto" => $_id52Proto,
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
$_id55 = (isset($componentCtx["data"]->{"list"}) ? $componentCtx["data"]->{"list"} : null);
if (is_array($_id55) || is_object($_id55)) {
foreach ($_id55 as $_id54 => $value) {
$componentCtx["data"]->_id54 = $_id54;
$componentCtx["data"]->item = $value;
$sourceSlots = [];
$html .= call_user_func("_id53", 
(object)["title" => (isset($componentCtx["data"]->{"item"}->{"title"}) ? $componentCtx["data"]->{"item"}->{"title"} : null),
"text" => (isset($componentCtx["data"]->{"item"}->{"text"}) ? $componentCtx["data"]->{"item"}->{"text"} : null)], true, $componentCtx, "ui-label", $sourceSlots);
$sourceSlots = null;

}
}
$html .= "</div>";
return $html;
};
return call_user_func("_id52", $data, $noDataOutput);
}; ?>