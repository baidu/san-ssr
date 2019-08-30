<?php $render = function ($data, $noDataOutput) {
function _id135($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id135Proto = [
"toggle" => function(){},
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
"proto" => $_id135Proto,
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
$html .= "<h1>";
if (!isset($componentCtx["slotRenderers"]["_id136"])) $componentCtx["slotRenderers"]["_id136"] = function () use (&$componentCtx, &$html){
$defaultSlotRender = function ($componentCtx) {
  $html = "";
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
call_user_func($componentCtx["slotRenderers"]["_id136"]);
$html .= "</h1>";
if (!isset($componentCtx["slotRenderers"]["_id137"])) $componentCtx["slotRenderers"]["_id137"] = function () use (&$componentCtx, &$html){
$defaultSlotRender = function ($componentCtx) {
  $html = "";
  return $html;
};
$isInserted = false;
$ctxSourceSlots = $componentCtx["sourceSlots"];
$mySourceSlots = [];
$slotName = "content";
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
call_user_func($componentCtx["slotRenderers"]["_id137"]);
$html .= "</div>";
return $html;
};
function _id134($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id134Proto = [
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
"proto" => $_id134Proto,
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
array_push($sourceSlots, [function ($componentCtx) {
  $html = "";
$html .= "<b>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"name"}) ? $componentCtx["data"]->{"name"} : null));
$html .= "</b>";

  return $html;
}, "title"]);
array_push($sourceSlots, [function ($componentCtx) {
  $html = "";
if ((isset($componentCtx["data"]->{"num"}) ? $componentCtx["data"]->{"num"} : null)>10000) {
$html .= "<h2>biiig</h2><p>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"num"}) ? $componentCtx["data"]->{"num"} : null));
$html .= "</p>";

}
else if ((isset($componentCtx["data"]->{"num"}) ? $componentCtx["data"]->{"num"} : null)>1000) {
$html .= "<h3>biig</h3><p>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"num"}) ? $componentCtx["data"]->{"num"} : null));
$html .= "</p>";

}
else if ((isset($componentCtx["data"]->{"num"}) ? $componentCtx["data"]->{"num"} : null)>100) {
$html .= "<h4>big</h4><p>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"num"}) ? $componentCtx["data"]->{"num"} : null));
$html .= "</p>";

}
else {
$html .= "<h5>small</h5><p>";
$html .= San::escapeHTML((isset($componentCtx["data"]->{"num"}) ? $componentCtx["data"]->{"num"} : null));
$html .= "</p>";

}

  return $html;
}, "content"]);
$html .= call_user_func("_id135", 
(object)["hidden" => (isset($componentCtx["data"]->{"folderHidden"}) ? $componentCtx["data"]->{"folderHidden"} : null)], true, $componentCtx, "x-folder", $sourceSlots);
$sourceSlots = null;
$html .= "</div>";
return $html;
};
return call_user_func("_id134", $data, $noDataOutput);
}; ?>