<?php $render = function ($data, $noDataOutput) {
function _id178($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id178Proto = [
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
"proto" => $_id178Proto,
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
$_id180 = (isset($componentCtx["data"]->{"list"}) ? $componentCtx["data"]->{"list"} : null);
if (is_array($_id180) || is_object($_id180)) {
foreach ($_id180 as $_id179 => $value) {
$componentCtx["data"]->_id179 = $_id179;
$componentCtx["data"]->item = $value;
$html .= "<li";
if ((isset($componentCtx["data"]->{"item"}) ? $componentCtx["data"]->{"item"} : null)) {
$html .= San::attrFilter('title', San::escapeHTML((isset($componentCtx["data"]->{"item"}) ? $componentCtx["data"]->{"item"} : null)));
}
$html .= ">";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"item"}) ? $componentCtx["data"]->{"item"} : null));
$html .= "</li>";

}
}
$html .= "</ul>";
return $html;
};
function _id177($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id177Proto = [
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
"proto" => $_id177Proto,
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
$_id182 = (isset($componentCtx["data"]->{"list"}) ? $componentCtx["data"]->{"list"} : null);
if (is_array($_id182) || is_object($_id182)) {
foreach ($_id182 as $_id181 => $value) {
$componentCtx["data"]->_id181 = $_id181;
$componentCtx["data"]->item = $value;
$html .= "<dl><dt";
if ((isset($componentCtx["data"]->{"item"}->{"name"}) ? $componentCtx["data"]->{"item"}->{"name"} : null)) {
$html .= San::attrFilter('title', San::escapeHTML((isset($componentCtx["data"]->{"item"}->{"name"}) ? $componentCtx["data"]->{"item"}->{"name"} : null)));
}
$html .= ">";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"item"}->{"name"}) ? $componentCtx["data"]->{"item"}->{"name"} : null));
$html .= "</dt><dd>";
$sourceSlots = [];
$html .= call_user_func("_id178", 
(object)["list" => (isset($componentCtx["data"]->{"item"}->{"tels"}) ? $componentCtx["data"]->{"item"}->{"tels"} : null)], true, $componentCtx, "ui-tel", $sourceSlots);
$sourceSlots = null;
$html .= "</dd></dl>";

}
}
$html .= "</div>";
return $html;
};
function _id176($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id176Proto = [
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
"proto" => $_id176Proto,
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
if ((isset($componentCtx["data"]->{"cond"}) ? $componentCtx["data"]->{"cond"} : null)) {
$sourceSlots = [];
$html .= call_user_func("_id177", 
(object)["list" => (isset($componentCtx["data"]->{"persons"}) ? $componentCtx["data"]->{"persons"} : null)], true, $componentCtx, "ui-person", $sourceSlots);
$sourceSlots = null;

}
$html .= "</div>";
return $html;
};
return call_user_func("_id176", $data, $noDataOutput);
}; ?>