<?php $render = function ($data, $noDataOutput) {
function _id264($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id264Proto = [
"filters" => [

],
"computed" => [

],
"computedNames" => [

],
"tagName" => "form"
];
$html = "";
$componentCtx = [
"proto" => $_id264Proto,
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
$html .= "<form";
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
$_id266 = (isset($componentCtx["data"]->{"cates"}) ? $componentCtx["data"]->{"cates"} : null);
if (is_array($_id266) || is_object($_id266)) {
foreach ($_id266 as $_id265 => $value) {
$componentCtx["data"]->_id265 = $_id265;
$componentCtx["data"]->cate = $value;
$html .= "<fieldset>";
$_id268 = (isset($componentCtx["data"]->{"forms"}->{(isset($componentCtx["data"]->{"cate"}) ? $componentCtx["data"]->{"cate"} : null)}) ? $componentCtx["data"]->{"forms"}->{(isset($componentCtx["data"]->{"cate"}) ? $componentCtx["data"]->{"cate"} : null)} : null);
if (is_array($_id268) || is_object($_id268)) {
foreach ($_id268 as $_id267 => $value) {
$componentCtx["data"]->_id267 = $_id267;
$componentCtx["data"]->item = $value;
$html .= "<label>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"item"}) ? $componentCtx["data"]->{"item"} : null));
$html .= "</label>";

}
}
$html .= "</fieldset>";

}
}
$html .= "</form>";
return $html;
};
return call_user_func("_id264", $data, $noDataOutput);
}; ?>