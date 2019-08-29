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
"data" => $data ? $data : ["title" => "5","text" => "five"],
"owner" => $parentCtx,
"slotRenderers" => []
];
if ($data) {
$componentCtx["data"]["title"] = isset($componentCtx["data"]["title"]) ? $componentCtx["data"]["title"] : "5";
$componentCtx["data"]["text"] = isset($componentCtx["data"]["text"]) ? $componentCtx["data"]["text"] : "five";
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
$html .= "<div class=\"head\">";
if (!isset($componentCtx["slotRenderers"]["_id3"])) $componentCtx["slotRenderers"]["_id3"] = function () use (&$componentCtx, &$html){
$defaultSlotRender = function ($componentCtx) {
  $html = "";
$html .= "<h3";
if ((isset($componentCtx["data"]["title"]) ? $componentCtx["data"]["title"] : null)) {
$html .= San::attrFilter('title', San::escapeHTML((isset($componentCtx["data"]["title"]) ? $componentCtx["data"]["title"] : null)));
}
$html .= ">";
$html .= San::escapeHTML((isset($componentCtx["data"]["title"]) ? $componentCtx["data"]["title"] : null));
$html .= "</h3>";

  return $html;
};
$isInserted = false;
$ctxSourceSlots = $componentCtx["sourceSlots"];
$mySourceSlots = [];
$slotName = "title";
foreach ($ctxSourceSlots as $i => $slot) {
  if (count($slot) > 1 && $slot[1] == $slotName) {
    array_push($mySourceSlots, $slot[0]);
    $isInserted = true;
  }
}
if (!$isInserted) { array_push($mySourceSlots, $defaultSlotRender); }
$slotCtx = $isInserted ? $componentCtx["owner"] : $componentCtx;
foreach ($mySourceSlots as $renderIndex => $slot) {
  $html .= $slot($slotCtx);
}
};
call_user_func($componentCtx["slotRenderers"]["_id3"]);
$html .= "</div><div>";
if (!isset($componentCtx["slotRenderers"]["_id4"])) $componentCtx["slotRenderers"]["_id4"] = function () use (&$componentCtx, &$html){
$defaultSlotRender = function ($componentCtx) {
  $html = "";
$html .= "<p";
if ((isset($componentCtx["data"]["text"]) ? $componentCtx["data"]["text"] : null)) {
$html .= San::attrFilter('title', San::escapeHTML((isset($componentCtx["data"]["text"]) ? $componentCtx["data"]["text"] : null)));
}
$html .= ">";
$html .= San::escapeHTML((isset($componentCtx["data"]["text"]) ? $componentCtx["data"]["text"] : null));
$html .= "</p>";

  return $html;
};
$isInserted = false;
$ctxSourceSlots = $componentCtx["sourceSlots"];
$mySourceSlots = [];
if (count($ctxSourceSlots) > 0 && !isset($ctxSourceSlots[0][1])) {
  array_push($mySourceSlots, $ctxSourceSlots[0][0]);
  $isInserted = true;
}
if (!$isInserted) { array_push($mySourceSlots, $defaultSlotRender); }
$slotCtx = $isInserted ? $componentCtx["owner"] : $componentCtx;
foreach ($mySourceSlots as $renderIndex => $slot) {
  $html .= $slot($slotCtx);
}
};
call_user_func($componentCtx["slotRenderers"]["_id4"]);
$html .= "</div></div>";
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
$sourceSlots = [];
$html .= call_user_func("_id2", 
["title" => (isset($componentCtx["data"]["tTitle"]) ? $componentCtx["data"]["tTitle"] : null),
"text" => (isset($componentCtx["data"]["tText"]) ? $componentCtx["data"]["tText"] : null)], true, $componentCtx, "ui-tab", $sourceSlots);
$sourceSlots = null;
$html .= "</div>";
return $html;
};
return call_user_func("_id1", $data, $noDataOutput);
}; ?>