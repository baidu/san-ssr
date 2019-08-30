<?php $render = function ($data, $noDataOutput) {
function _id128($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id128Proto = [
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
"proto" => $_id128Proto,
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
$_id130 = (isset($componentCtx["data"]->{"list"}) ? $componentCtx["data"]->{"list"} : null);
if (is_array($_id130) || is_object($_id130)) {
foreach ($_id130 as $_id129 => $value) {
$componentCtx["data"]->_id129 = $_id129;
$componentCtx["data"]->item = $value;
$html .= "<li>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"item"}) ? $componentCtx["data"]->{"item"} : null));
$html .= "</li>";

}
}
$html .= "</ul>";
return $html;
};
function _id127($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id127Proto = [
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
"proto" => $_id127Proto,
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
$html .= call_user_func("_id128", 
(object)["list" => San::spread([1, true, (isset($componentCtx["data"]->{"ext"}) ? $componentCtx["data"]->{"ext"} : null), "erik", (isset($componentCtx["data"]->{"ext2"}) ? $componentCtx["data"]->{"ext2"} : null)], [0,0,1,0,1])], true, $componentCtx, "x-l", $sourceSlots);
$sourceSlots = null;
$html .= "</div>";
return $html;
};
return call_user_func("_id127", $data, $noDataOutput);
}; ?>