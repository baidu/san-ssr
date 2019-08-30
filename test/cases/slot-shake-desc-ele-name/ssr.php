<?php $render = function ($data, $noDataOutput) {
function _id41($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id41Proto = [
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
"proto" => $_id41Proto,
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
$html .= "    ";
$_id43 = (isset($componentCtx["data"]->{"columns"}) ? $componentCtx["data"]->{"columns"} : null);
if (is_array($_id43) || is_object($_id43)) {
foreach ($_id43 as $_id42 => $value) {
$componentCtx["data"]->_id42 = $_id42;
$componentCtx["data"]->col = $value;
$html .= "<h3>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"col"}->{"label"}) ? $componentCtx["data"]->{"col"}->{"label"} : null));
$html .= "</h3>";

}
}
$html .= "    ";
$_id45 = (isset($componentCtx["data"]->{"datasource"}) ? $componentCtx["data"]->{"datasource"} : null);
if (is_array($_id45) || is_object($_id45)) {
foreach ($_id45 as $_id44 => $value) {
$componentCtx["data"]->_id44 = $_id44;
$componentCtx["data"]->row = $value;
$html .= "<ul>      ";
$_id47 = (isset($componentCtx["data"]->{"columns"}) ? $componentCtx["data"]->{"columns"} : null);
if (is_array($_id47) || is_object($_id47)) {
foreach ($_id47 as $_id46 => $value) {
$componentCtx["data"]->_id46 = $_id46;
$componentCtx["data"]->col = $value;
$html .= "<li>";
if (!isset($componentCtx["slotRenderers"]["_id48"])) $componentCtx["slotRenderers"]["_id48"] = function () use (&$componentCtx, &$html){
$defaultSlotRender = function ($componentCtx) {
  $html = "";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"row"}->{(isset($componentCtx["data"]->{"col"}->{"name"}) ? $componentCtx["data"]->{"col"}->{"name"} : null)}) ? $componentCtx["data"]->{"row"}->{(isset($componentCtx["data"]->{"col"}->{"name"}) ? $componentCtx["data"]->{"col"}->{"name"} : null)} : null));

  return $html;
};
$isInserted = false;
$ctxSourceSlots = $componentCtx["sourceSlots"];
$mySourceSlots = [];
$slotName = "col-" . San::escapeHTML((isset($componentCtx["data"]->{"col"}->{"name"}) ? $componentCtx["data"]->{"col"}->{"name"} : null));
foreach ($ctxSourceSlots as $i => $slot) {
  if (count($slot) > 1 && $slot[1] == $slotName) {
    array_push($mySourceSlots, $slot[0]);
    $isInserted = true;
  }
}
if (!$isInserted) { array_push($mySourceSlots, $defaultSlotRender); }
$slotCtx = $isInserted ? $componentCtx["owner"] : $componentCtx;
$slotCtx = ["data" => $slotCtx["data"], "proto" => $slotCtx["proto"], "owner" => $slotCtx["owner"]];
$slotCtx["data"]->row = (isset($componentCtx["data"]->{"row"}) ? $componentCtx["data"]->{"row"} : null);
$slotCtx["data"]->col = (isset($componentCtx["data"]->{"col"}) ? $componentCtx["data"]->{"col"} : null);
foreach ($mySourceSlots as $renderIndex => $slot) {
  $html .= $slot($slotCtx);
}
};
call_user_func($componentCtx["slotRenderers"]["_id48"]);
$html .= "</li>";

}
}
$html .= "    </ul>";

}
}
$html .= "</div>";
return $html;
};
function _id40($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id40Proto = [
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
"proto" => $_id40Proto,
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
$_id50 = (isset($componentCtx["data"]->{"deps"}) ? $componentCtx["data"]->{"deps"} : null);
if (is_array($_id50) || is_object($_id50)) {
foreach ($_id50 as $_id49 => $value) {
$componentCtx["data"]->_id49 = $_id49;
$componentCtx["data"]->dep = $value;
$sourceSlots = [];
array_push($sourceSlots, [function ($componentCtx) {
  $html = "";
$html .= "<b>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"row"}->{(isset($componentCtx["data"]->{"col"}->{"name"}) ? $componentCtx["data"]->{"col"}->{"name"} : null)}) ? $componentCtx["data"]->{"row"}->{(isset($componentCtx["data"]->{"col"}->{"name"}) ? $componentCtx["data"]->{"col"}->{"name"} : null)} : null));
$html .= "</b>";

  return $html;
}, "col-" . San::escapeHTML((isset($componentCtx["data"]->{"dep"}->{"strong"}) ? $componentCtx["data"]->{"dep"}->{"strong"} : null))]);
$html .= call_user_func("_id41", 
(object)["columns" => (isset($componentCtx["data"]->{"dep"}->{"columns"}) ? $componentCtx["data"]->{"dep"}->{"columns"} : null),
"datasource" => (isset($componentCtx["data"]->{"dep"}->{"members"}) ? $componentCtx["data"]->{"dep"}->{"members"} : null)], true, $componentCtx, "x-table", $sourceSlots);
$sourceSlots = null;

}
}
$html .= "</div>";
return $html;
};
return call_user_func("_id40", $data, $noDataOutput);
}; ?>