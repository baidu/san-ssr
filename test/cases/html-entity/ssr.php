<?php $render = function ($data, $noDataOutput) {
function _id125($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id125Proto = [
"filters" => [

],
"computed" => [

],
"computedNames" => [

],
"tagName" => "u"
];
$html = "";
$componentCtx = [
"proto" => $_id125Proto,
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
$html .= "<u";
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
$html .= "&#39;&#x00021;&emsp;&ensp;&thinsp;&copy;&lt;p&gt;&reg;&lt;/p&gt;&reg;&zwnj;&zwj;&lt;&nbsp;&gt;&quot;</u>";
return $html;
};
return call_user_func("_id125", $data, $noDataOutput);
}; ?>