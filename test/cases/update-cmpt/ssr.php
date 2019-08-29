<?php $render = function ($data, $noDataOutput) {
function _id2($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id2Proto = [
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
"proto" => $_id2Proto,
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
$html .= "<a";
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
if ((array_key_exists("title", $componentCtx["data"]) ? $componentCtx["data"]["title"] : null)) {
$html .= San::attrFilter('title', San::escapeHTML((array_key_exists("title", $componentCtx["data"]) ? $componentCtx["data"]["title"] : null)));
}
$html .= ">";
$html .= San::escapeHTML((array_key_exists("text", $componentCtx["data"]) ? $componentCtx["data"]["text"] : null));
$html .= "</span></a>";
return $html;
};
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
$html .= "<h5>";
$sourceSlots = [];
$html .= call_user_func("_id2", 
["title" => (array_key_exists("name", $componentCtx["data"]) ? $componentCtx["data"]["name"] : null),
"text" => (array_key_exists("jokeName", $componentCtx["data"]) ? $componentCtx["data"]["jokeName"] : null)], true, $componentCtx, "ui-label", $sourceSlots);
$sourceSlots = null;
$html .= "</h5><p><a>";
$html .= San::escapeHTML((array_key_exists("school", $componentCtx["data"]) ? $componentCtx["data"]["school"] : null));
$html .= "</a><u>";
$html .= San::escapeHTML((array_key_exists("company", $componentCtx["data"]) ? $componentCtx["data"]["company"] : null));
$html .= "</u></p></div>";
return $html;
};
return call_user_func("_id1", $data, $noDataOutput);
}; ?>