<?php $render = function ($data, $noDataOutput) {
function _id2($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id2Proto = [
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
"proto" => $_id2Proto,
"sourceSlots" => $sourceSlots,
"data" => $data ? $data : (object)["styles" => (object)["main" => (object)["position" => "fixed","display" => "block"]],"classes" => (object)["main" => ["ui","ui-label"]]],
"owner" => $parentCtx,
"slotRenderers" => []
];
if ($data) {
$componentCtx["data"]->styles = isset($componentCtx["data"]->styles) ? $componentCtx["data"]->styles : (object)["main" => (object)["position" => "fixed","display" => "block"]];
$componentCtx["data"]->classes = isset($componentCtx["data"]->classes) ? $componentCtx["data"]->classes : (object)["main" => ["ui","ui-label"]];
}
$computedNames = $componentCtx["proto"]["computedNames"];
foreach ($computedNames as $i => $computedName) {
  $data[$computedName] = $componentCtx["proto"]["computed"][$computedName]($componentCtx);
}
$html .= "<span";
$html .= San::attrFilter('class', San::escapeHTML(San::_xclassFilter((isset($componentCtx["data"]->{"class"}) ? $componentCtx["data"]->{"class"} : null), San::escapeHTML(San::_classFilter((isset($componentCtx["data"]->{"classes"}->{"main"}) ? $componentCtx["data"]->{"classes"}->{"main"} : null))))));
$html .= San::attrFilter('style', San::escapeHTML(San::_xstyleFilter((isset($componentCtx["data"]->{"style"}) ? $componentCtx["data"]->{"style"} : null), San::escapeHTML(San::_styleFilter((isset($componentCtx["data"]->{"styles"}->{"main"}) ? $componentCtx["data"]->{"styles"}->{"main"} : null))))));
if ((isset($componentCtx["data"]->{"id"}) ? $componentCtx["data"]->{"id"} : null)) {
$html .= San::attrFilter('id', San::escapeHTML((isset($componentCtx["data"]->{"id"}) ? $componentCtx["data"]->{"id"} : null)));
}
$html .= ">";
if (!$noDataOutput) {
$html .= "<!--s-data:" . json_encode($componentCtx["data"], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "-->";
}
$html .= "label</span>";
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
"tagName" => "a"
];
$html = "";
$componentCtx = [
"proto" => $_id1Proto,
"sourceSlots" => $sourceSlots,
"data" => $data ? $data : (object)["styles" => (object)["main" => (object)["width" => "50px","height" => "50px"],"title" => (object)["width" => "50px","height" => "20px"]],"classes" => (object)["main" => ["app","main"],"title" => ["app-title","main-title"]]],
"owner" => $parentCtx,
"slotRenderers" => []
];
if ($data) {
$componentCtx["data"]->styles = isset($componentCtx["data"]->styles) ? $componentCtx["data"]->styles : (object)["main" => (object)["width" => "50px","height" => "50px"],"title" => (object)["width" => "50px","height" => "20px"]];
$componentCtx["data"]->classes = isset($componentCtx["data"]->classes) ? $componentCtx["data"]->classes : (object)["main" => ["app","main"],"title" => ["app-title","main-title"]];
}
$computedNames = $componentCtx["proto"]["computedNames"];
foreach ($computedNames as $i => $computedName) {
  $data[$computedName] = $componentCtx["proto"]["computed"][$computedName]($componentCtx);
}
$html .= "<a";
$html .= San::attrFilter('class', San::escapeHTML(San::_xclassFilter((isset($componentCtx["data"]->{"class"}) ? $componentCtx["data"]->{"class"} : null), San::escapeHTML(San::_classFilter((isset($componentCtx["data"]->{"classes"}->{"main"}) ? $componentCtx["data"]->{"classes"}->{"main"} : null))))));
$html .= San::attrFilter('style', San::escapeHTML(San::_xstyleFilter((isset($componentCtx["data"]->{"style"}) ? $componentCtx["data"]->{"style"} : null), San::escapeHTML(San::_styleFilter((isset($componentCtx["data"]->{"styles"}->{"main"}) ? $componentCtx["data"]->{"styles"}->{"main"} : null))))));
if ((isset($componentCtx["data"]->{"id"}) ? $componentCtx["data"]->{"id"} : null)) {
$html .= San::attrFilter('id', San::escapeHTML((isset($componentCtx["data"]->{"id"}) ? $componentCtx["data"]->{"id"} : null)));
}
$html .= ">";
if (!$noDataOutput) {
$html .= "<!--s-data:" . json_encode($componentCtx["data"], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "-->";
}
$html .= "<h3";
if ((isset($componentCtx["data"]->{"classes"}->{"title"}) ? $componentCtx["data"]->{"classes"}->{"title"} : null)) {
$html .= San::attrFilter('class', San::escapeHTML(San::_classFilter((isset($componentCtx["data"]->{"classes"}->{"title"}) ? $componentCtx["data"]->{"classes"}->{"title"} : null))));
}
if ((isset($componentCtx["data"]->{"styles"}->{"title"}) ? $componentCtx["data"]->{"styles"}->{"title"} : null)) {
$html .= San::attrFilter('style', San::escapeHTML(San::_styleFilter((isset($componentCtx["data"]->{"styles"}->{"title"}) ? $componentCtx["data"]->{"styles"}->{"title"} : null))));
}
$html .= "></h3>";
$sourceSlots = [];
$html .= call_user_func("_id2", 
(object)[], true, $componentCtx, "ui-label", $sourceSlots);
$sourceSlots = null;
$html .= "</a>";
return $html;
};
return call_user_func("_id1", $data, $noDataOutput);
}; ?>