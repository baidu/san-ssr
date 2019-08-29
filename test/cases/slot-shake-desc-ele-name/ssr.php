<?php $render = function ($data, $noDataOutput) {
function _id2($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id2Proto = [
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
"proto" => $_id2Proto,
"sourceSlots" => $sourceSlots,
"data" => $data ? $data : [],
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
if ((isset($componentCtx["data"]["class"]) ? $componentCtx["data"]["class"] : null)) {
$html .= San::attrFilter('class', San::escapeHTML(San::_classFilter((isset($componentCtx["data"]["class"]) ? $componentCtx["data"]["class"] : null))));
}
if ((isset($componentCtx["data"]["style"]) ? $componentCtx["data"]["style"] : null)) {
$html .= San::attrFilter('style', San::escapeHTML(San::_styleFilter((isset($componentCtx["data"]["style"]) ? $componentCtx["data"]["style"] : null))));
}
if ((isset($componentCtx["data"]["id"]) ? $componentCtx["data"]["id"] : null)) {
$html .= San::attrFilter('id', San::escapeHTML((isset($componentCtx["data"]["id"]) ? $componentCtx["data"]["id"] : null)));
}
$html .= ">";
if (!$noDataOutput) {
$html .= "<!--s-data:" . json_encode($componentCtx["data"], JSON_UNESCAPED_UNICODE) . "-->";
}
$html .= "    ";
$_id4 = (isset($componentCtx["data"]["columns"]) ? $componentCtx["data"]["columns"] : null);
if (is_array($_id4)) {
foreach ($_id4 as $_id3 => $value) {
$componentCtx["data"]["_id3"] = $_id3;
$componentCtx["data"]["col"] = $value;
$html .= "<h3>";
$html .= San::escapeHTML((isset($componentCtx["data"]["col"]["label"]) ? $componentCtx["data"]["col"]["label"] : null));
$html .= "</h3>";

}
}
$html .= "    ";
$_id6 = (isset($componentCtx["data"]["datasource"]) ? $componentCtx["data"]["datasource"] : null);
if (is_array($_id6)) {
foreach ($_id6 as $_id5 => $value) {
$componentCtx["data"]["_id5"] = $_id5;
$componentCtx["data"]["row"] = $value;
$html .= "<ul>      ";
$_id8 = (isset($componentCtx["data"]["columns"]) ? $componentCtx["data"]["columns"] : null);
if (is_array($_id8)) {
foreach ($_id8 as $_id7 => $value) {
$componentCtx["data"]["_id7"] = $_id7;
$componentCtx["data"]["col"] = $value;
$html .= "<li>";
if (!isset($componentCtx["slotRenderers"]["_id9"])) $componentCtx["slotRenderers"]["_id9"] = function () use (&$componentCtx, &$html){
$defaultSlotRender = function ($componentCtx) {
  $html = "";
$html .= San::escapeHTML((isset($componentCtx["data"]["row"][(isset($componentCtx["data"]["col"]["name"]) ? $componentCtx["data"]["col"]["name"] : null)]) ? $componentCtx["data"]["row"][(isset($componentCtx["data"]["col"]["name"]) ? $componentCtx["data"]["col"]["name"] : null)] : null));

  return $html;
};
$isInserted = false;
$ctxSourceSlots = $componentCtx["sourceSlots"];
$mySourceSlots = [];
$slotName = "col-" . San::escapeHTML((isset($componentCtx["data"]["col"]["name"]) ? $componentCtx["data"]["col"]["name"] : null));
foreach ($ctxSourceSlots as $i => $slot) {
  if (count($slot) > 1 && $slot[1] == $slotName) {
    array_push($mySourceSlots, $slot[0]);
    $isInserted = true;
  }
}
if (!$isInserted) { array_push($mySourceSlots, $defaultSlotRender); }
$slotCtx = $isInserted ? $componentCtx["owner"] : $componentCtx;
$slotCtx = ["data" => $slotCtx["data"], "proto" => $slotCtx["proto"], "owner" => $slotCtx["owner"]];
$slotCtx["data"]["row"] = (isset($componentCtx["data"]["row"]) ? $componentCtx["data"]["row"] : null);
$slotCtx["data"]["col"] = (isset($componentCtx["data"]["col"]) ? $componentCtx["data"]["col"] : null);
foreach ($mySourceSlots as $renderIndex => $slot) {
  $html .= $slot($slotCtx);
}
};
call_user_func($componentCtx["slotRenderers"]["_id9"]);
$html .= "</li>";

}
}
$html .= "    </ul>";

}
}
$html .= "</div>";
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
"tagName" => "div"
];
$html = "";
$componentCtx = [
"proto" => $_id1Proto,
"sourceSlots" => $sourceSlots,
"data" => $data ? $data : [],
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
if ((isset($componentCtx["data"]["class"]) ? $componentCtx["data"]["class"] : null)) {
$html .= San::attrFilter('class', San::escapeHTML(San::_classFilter((isset($componentCtx["data"]["class"]) ? $componentCtx["data"]["class"] : null))));
}
if ((isset($componentCtx["data"]["style"]) ? $componentCtx["data"]["style"] : null)) {
$html .= San::attrFilter('style', San::escapeHTML(San::_styleFilter((isset($componentCtx["data"]["style"]) ? $componentCtx["data"]["style"] : null))));
}
if ((isset($componentCtx["data"]["id"]) ? $componentCtx["data"]["id"] : null)) {
$html .= San::attrFilter('id', San::escapeHTML((isset($componentCtx["data"]["id"]) ? $componentCtx["data"]["id"] : null)));
}
$html .= ">";
if (!$noDataOutput) {
$html .= "<!--s-data:" . json_encode($componentCtx["data"], JSON_UNESCAPED_UNICODE) . "-->";
}
$_id11 = (isset($componentCtx["data"]["deps"]) ? $componentCtx["data"]["deps"] : null);
if (is_array($_id11)) {
foreach ($_id11 as $_id10 => $value) {
$componentCtx["data"]["_id10"] = $_id10;
$componentCtx["data"]["dep"] = $value;
$sourceSlots = [];
array_push($sourceSlots, [function ($componentCtx) {
  $html = "";
$html .= "<b>";
$html .= San::escapeHTML((isset($componentCtx["data"]["row"][(isset($componentCtx["data"]["col"]["name"]) ? $componentCtx["data"]["col"]["name"] : null)]) ? $componentCtx["data"]["row"][(isset($componentCtx["data"]["col"]["name"]) ? $componentCtx["data"]["col"]["name"] : null)] : null));
$html .= "</b>";

  return $html;
}, "col-" . San::escapeHTML((isset($componentCtx["data"]["dep"]["strong"]) ? $componentCtx["data"]["dep"]["strong"] : null))]);
$html .= call_user_func("_id2", 
["columns" => (isset($componentCtx["data"]["dep"]["columns"]) ? $componentCtx["data"]["dep"]["columns"] : null),
"datasource" => (isset($componentCtx["data"]["dep"]["members"]) ? $componentCtx["data"]["dep"]["members"] : null)], true, $componentCtx, "x-table", $sourceSlots);
$sourceSlots = null;

}
}
$html .= "</div>";
return $html;
};
return call_user_func("_id1", $data, $noDataOutput);
}; ?>