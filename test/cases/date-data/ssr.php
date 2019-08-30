<?php $render = function ($data, $noDataOutput) {
function _id69($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id69Proto = [
"filters" => [
"year" => function ($date) {
    return $date["getFullYear"]();
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
"proto" => $_id69Proto,
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
$html .= "<b";
if ((isset($componentCtx["data"]->{"date"}) ? $componentCtx["data"]->{"date"} : null)) {
$html .= San::attrFilter('title', San::escapeHTML(San::callFilter($componentCtx, "year", [(isset($componentCtx["data"]->{"date"}) ? $componentCtx["data"]->{"date"} : null)])));
}
$html .= ">";
$html .= San::escapeHTML(San::callFilter($componentCtx, "year", [(isset($componentCtx["data"]->{"date"}) ? $componentCtx["data"]->{"date"} : null)]));
$html .= "</b></div>";
return $html;
};
return call_user_func("_id69", $data, $noDataOutput);
}; ?>