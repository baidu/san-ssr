<?php $render = function ($data, $noDataOutput) {
function _id228($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id228Proto = [
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
"proto" => $_id228Proto,
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
$html .= San::escapeHTML((isset($componentCtx["data"]->{"a"}->{"title"}) ? $componentCtx["data"]->{"a"}->{"title"} : null));
$html .= "</h3><h4>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"a"}->{"from"}) ? $componentCtx["data"]->{"a"}->{"from"} : null));
$html .= "</h4>";
if ((isset($componentCtx["data"]->{"a"}->{"hot"}) ? $componentCtx["data"]->{"a"}->{"hot"} : null)) {
$html .= "<b>hot</b>";

}
if ((isset($componentCtx["data"]->{"a"}->{"author"}) ? $componentCtx["data"]->{"a"}->{"author"} : null)) {
$html .= "<div><u>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"a"}->{"author"}->{"name"}) ? $componentCtx["data"]->{"a"}->{"author"}->{"name"} : null));
$html .= "</u><a>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"a"}->{"author"}->{"email"}) ? $componentCtx["data"]->{"a"}->{"author"}->{"email"} : null));
$html .= "</a></div>";

}
$html .= "<p>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"a"}->{"content"}) ? $componentCtx["data"]->{"a"}->{"content"} : null));
$html .= "</p></div>";
return $html;
};
function _id227($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id227Proto = [
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
"proto" => $_id227Proto,
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
$html .= call_user_func("_id228", 
(object)["a" => San::objSpread([["author", (isset($componentCtx["data"]->{"aAuthor"}) ? $componentCtx["data"]->{"aAuthor"} : null)],["from", (isset($componentCtx["data"]->{"from"}) ? $componentCtx["data"]->{"from"} : null)],(isset($componentCtx["data"]->{"article"}) ? $componentCtx["data"]->{"article"} : null)], [0,0,1])], true, $componentCtx, "x-a", $sourceSlots);
$sourceSlots = null;
$html .= "</div>";
return $html;
};
return call_user_func("_id227", $data, $noDataOutput);
}; ?>