<?php $render = function ($data, $noDataOutput) {
function _id260($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id260Proto = [
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
"proto" => $_id260Proto,
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
$_id262 = (isset($componentCtx["data"]->{"list"}) ? $componentCtx["data"]->{"list"} : null);
if (is_array($_id262) || is_object($_id262)) {
foreach ($_id262 as $_id261 => $value) {
$componentCtx["data"]->_id261 = $_id261;
$componentCtx["data"]->item = $value;
$html .= "<input type=\"checkbox\"";
if ((isset($componentCtx["data"]->{"item"}) ? $componentCtx["data"]->{"item"} : null)) {
$html .= San::attrFilter('value', San::escapeHTML((isset($componentCtx["data"]->{"item"}) ? $componentCtx["data"]->{"item"} : null)));
}
if (San::contains((isset($componentCtx["data"]->{"cValue"}) ? $componentCtx["data"]->{"cValue"} : null), San::escapeHTML((isset($componentCtx["data"]->{"item"}) ? $componentCtx["data"]->{"item"} : null)))) {
$html .= " checked";
}
$html .= ">";

}
}
$html .= "</div>";
return $html;
};
return call_user_func("_id260", $data, $noDataOutput);
}; ?>