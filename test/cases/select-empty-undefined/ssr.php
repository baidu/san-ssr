<?php $render = function ($data, $noDataOutput) {
function _id300($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id300Proto = [
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
"proto" => $_id300Proto,
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
if ((isset($componentCtx["data"]->{"online"}) ? $componentCtx["data"]->{"online"} : null)) {
$html .= San::attrFilter('title', San::escapeHTML((isset($componentCtx["data"]->{"online"}) ? $componentCtx["data"]->{"online"} : null)));
}
$html .= ">";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"online"}) ? $componentCtx["data"]->{"online"} : null));
$html .= "</b><select";
$selectValue = (isset($componentCtx["data"]->{"online"}) ? $componentCtx["data"]->{"online"} : null)?(isset($componentCtx["data"]->{"online"}) ? $componentCtx["data"]->{"online"} : null): "";
$html .= ">";
$_id302 = (isset($componentCtx["data"]->{"persons"}) ? $componentCtx["data"]->{"persons"} : null);
if (is_array($_id302) || is_object($_id302)) {
foreach ($_id302 as $_id301 => $value) {
$componentCtx["data"]->_id301 = $_id301;
$componentCtx["data"]->p = $value;
$html .= "<option";
$optionValue = San::escapeHTML((isset($componentCtx["data"]->{"p"}) ? $componentCtx["data"]->{"p"} : null));
if (isset($optionValue)) {
$html .= " value=\"" . $optionValue . "\"";
}
if ($optionValue == $selectValue) {
$html .= " selected";
}
$html .= ">";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"p"}) ? $componentCtx["data"]->{"p"} : null));
$html .= "</option>";
$optionValue = null;

}
}
$html .= "<option";
$optionValue = "";
if (isset($optionValue)) {
$html .= " value=\"" . $optionValue . "\"";
}
if ($optionValue == $selectValue) {
$html .= " selected";
}
$html .= ">empty</option>";
$optionValue = null;
$html .= "</select>";
$selectValue = null;
$html .= "</div>";
return $html;
};
return call_user_func("_id300", $data, $noDataOutput);
}; ?>