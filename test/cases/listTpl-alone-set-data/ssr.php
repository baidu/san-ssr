<?php $render = function ($data, $noDataOutput) {
function _id238($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id238Proto = [
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
"proto" => $_id238Proto,
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
$_id239 = (isset($componentCtx["data"]->{"persons"}) ? $componentCtx["data"]->{"persons"} : null);
if (is_array($_id239) || is_object($_id239)) {
foreach ($_id239 as $i => $value) {
$componentCtx["data"]->i = $i;
$componentCtx["data"]->p = $value;
$html .= "  <h4>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"p"}->{"name"}) ? $componentCtx["data"]->{"p"}->{"name"} : null));
$html .= "</h4><p>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"p"}->{"email"}) ? $componentCtx["data"]->{"p"}->{"email"} : null));
$html .= "</p>";

}
}
$html .= "  </div>";
return $html;
};
return call_user_func("_id238", $data, $noDataOutput);
}; ?>