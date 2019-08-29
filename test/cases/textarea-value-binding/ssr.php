<?php $render = function ($data, $noDataOutput) {
function _id1($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id1Proto = [
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
"proto" => $_id1Proto,
"sourceSlots" => $sourceSlots,
"data" => $data ? $data : [],
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
if ((array_key_exists("class", $componentCtx["data"]) ? $componentCtx["data"]["class"] : null)) {
$html .= San::attrFilter('class', San::escapeHTML(San::_classFilter((array_key_exists("class", $componentCtx["data"]) ? $componentCtx["data"]["class"] : null))));
}
if ((array_key_exists("style", $componentCtx["data"]) ? $componentCtx["data"]["style"] : null)) {
$html .= San::attrFilter('style', San::escapeHTML(San::_styleFilter((array_key_exists("style", $componentCtx["data"]) ? $componentCtx["data"]["style"] : null))));
}
if ((array_key_exists("id", $componentCtx["data"]) ? $componentCtx["data"]["id"] : null)) {
$html .= San::attrFilter('id', San::escapeHTML((array_key_exists("id", $componentCtx["data"]) ? $componentCtx["data"]["id"] : null)));
}
$html .= ">";
if (!$noDataOutput) {
$html .= "<!--s-data:" . json_encode($componentCtx["data"]) . "-->";
}
$html .= "<span";
if ((array_key_exists("name", $componentCtx["data"]) ? $componentCtx["data"]["name"] : null)) {
$html .= San::attrFilter('title', San::escapeHTML((array_key_exists("name", $componentCtx["data"]) ? $componentCtx["data"]["name"] : null)));
}
$html .= ">";
$html .= San::escapeHTML((array_key_exists("name", $componentCtx["data"]) ? $componentCtx["data"]["name"] : null));
$html .= "</span> <textarea>";
$html .= San::escapeHTML((array_key_exists("name", $componentCtx["data"]) ? $componentCtx["data"]["name"] : null));
$html .= "</textarea></div>";
return $html;
};
return call_user_func("_id1", $data, $noDataOutput);
}; ?>