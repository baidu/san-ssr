<?php $render = function ($data, $noDataOutput) {
function _id258($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id258Proto = [
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
"proto" => $_id258Proto,
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
$html .= "<h3>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"title"}) ? $componentCtx["data"]->{"title"} : null));
$html .= "</h3>";
if ((isset($componentCtx["data"]->{"subtitle"}) ? $componentCtx["data"]->{"subtitle"} : null)) {
$html .= "<h4>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"subtitle"}) ? $componentCtx["data"]->{"subtitle"} : null));
$html .= "</h4>";

}
$html .= "<p>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"content"}) ? $componentCtx["data"]->{"content"} : null));
$html .= "</p></div>";
return $html;
};
function _id257($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id257Proto = [
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
"proto" => $_id257Proto,
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
$html .= call_user_func("_id258", 
San::extend((isset($componentCtx["data"]->{"article"}) ? $componentCtx["data"]->{"article"} : null), (object)["title" => (isset($componentCtx["data"]->{"title"}) ? $componentCtx["data"]->{"title"} : null)]), true, $componentCtx, "x-a", $sourceSlots);
$sourceSlots = null;
$html .= "<a";
if ((isset($componentCtx["data"]->{"target"}) ? $componentCtx["data"]->{"target"} : null)) {
$html .= San::attrFilter('target', San::escapeHTML((isset($componentCtx["data"]->{"target"}) ? $componentCtx["data"]->{"target"} : null)));
}
(function ($bindObj) use (&$html){foreach ($bindObj as $key => $value) {
switch ($key) {
case "readonly":
case "disabled":
case "multiple":
case "multiple":
$html .= San::boolAttrFilter($key, San::escapeHTML($value));
break;
default:
$html .= San::attrFilter($key, San::escapeHTML($value));}
}})((isset($componentCtx["data"]->{"aProps"}) ? $componentCtx["data"]->{"aProps"} : null));
$html .= ">link</a></div>";
return $html;
};
return call_user_func("_id257", $data, $noDataOutput);
}; ?>