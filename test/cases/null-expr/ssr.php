<?php $render = function ($data, $noDataOutput) {
function _id174($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id174Proto = [
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
"proto" => $_id174Proto,
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
if ((isset($componentCtx["data"]->{"nullValue"}) ? $componentCtx["data"]->{"nullValue"} : null)===null) {
$html .= "<b>b</b>";

}
$html .= "</a>";
return $html;
};
return call_user_func("_id174", $data, $noDataOutput);
}; ?>