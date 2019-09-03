<?php $render = function ($data, $noDataOutput) {
function _id1($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id1Proto = [
"filters" => [

],
"computed" => [
"less" => function ($componentCtx) {
            return (isset($componentCtx["data"]->{"normal"}) ? $componentCtx["data"]->{"normal"} : null) - 1
        },"normal" => function ($componentCtx) {
            return (isset($componentCtx["data"]->{"num"}) ? $componentCtx["data"]->{"num"} : null)
        },"more" => function ($componentCtx) {
            return (isset($componentCtx["data"]->{"normal"}) ? $componentCtx["data"]->{"normal"} : null) + 1
        }
],
"computedNames" => [
"normal","less","more"
],
"tagName" => "div"
];
$html = "";
$componentCtx = [
"proto" => $_id1Proto,
"sourceSlots" => $sourceSlots,
"data" => $data ? $data : (object)["less" => NaN,"more" => NaN],
"owner" => $parentCtx,
"slotRenderers" => []
];
if ($data) {
$componentCtx["data"]->less = isset($componentCtx["data"]->less) ? $componentCtx["data"]->less : NaN;
$componentCtx["data"]->more = isset($componentCtx["data"]->more) ? $componentCtx["data"]->more : NaN;
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
$html .= "<a>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"less"}) ? $componentCtx["data"]->{"less"} : null));
$html .= "</a><u>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"normal"}) ? $componentCtx["data"]->{"normal"} : null));
$html .= "</u><b>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"more"}) ? $componentCtx["data"]->{"more"} : null));
$html .= "</b></div>";
return $html;
};
return call_user_func("_id1", $data, $noDataOutput);
}; ?>