<?php $render = function ($data, $noDataOutput) {
function _id122($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id122Proto = [
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
"proto" => $_id122Proto,
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
$html .= "<li>name - email</li>";
$_id123 = (isset($componentCtx["data"]->{"persons"}) ? $componentCtx["data"]->{"persons"} : null);
if (is_array($_id123) || is_object($_id123)) {
foreach ($_id123 as $i => $value) {
$componentCtx["data"]->i = $i;
$componentCtx["data"]->p = $value;
$html .= "<li";
if ((isset($componentCtx["data"]->{"p"}->{"name"}) ? $componentCtx["data"]->{"p"}->{"name"} : null)) {
$html .= San::attrFilter('title', San::escapeHTML((isset($componentCtx["data"]->{"p"}->{"name"}) ? $componentCtx["data"]->{"p"}->{"name"} : null)));
}
$html .= ">";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"p"}->{"name"}) ? $componentCtx["data"]->{"p"}->{"name"} : null)) . " - " . San::escapeHTML((isset($componentCtx["data"]->{"p"}->{"email"}) ? $componentCtx["data"]->{"p"}->{"email"} : null));
$html .= "</li>";

}
}
$html .= "<li>name - email</li></ul>";
return $html;
};
return call_user_func("_id122", $data, $noDataOutput);
}; ?>