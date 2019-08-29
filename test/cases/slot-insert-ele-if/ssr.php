<?php $render = function ($data, $noDataOutput) {
function _id2($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id2Proto = [
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
if ((array_key_exists("class", $componentCtx["data"]) ? $componentCtx["data"]["class"] : null)) {
$html .= San::attrFilter('class', San::escapeHTML(San::_classFilter((array_key_exists("class", $componentCtx["data"]) ? $componentCtx["data"]["class"] : null))));
}
if ((array_key_exists("style", $componentCtx["data"]) ? $componentCtx["data"]["style"] : null)) {
$html .= San::attrFilter('style', San::escapeHTML(San::_styleFilter((array_key_exists("style", $componentCtx["data"]) ? $componentCtx["data"]["style"] : null))));
}
if ((array_key_exists("id", $componentCtx["data"]) ? $componentCtx["data"]["id"] : null)) {
$html .= San::attrFilter('id', San::escapeHTML((array_key_exists("id", $componentCtx["data"]) ? $componentCtx["data"]["id"] : null)));
}
$html .= ">";
if (!$noDataOutput) {
$html .= "<!--s-data:" . json_encode($componentCtx["data"]) . "-->";
}
$html .= "<h1>";
if (!array_key_exists("_id3", $componentCtx["slotRenderers"])) $componentCtx["slotRenderers"]["_id3"] = function () use ($componentCtx, &$html){
$defaultSlotRender = function ($componentCtx) {
  $html = "";
  return $html;
};
$isInserted = false;
$ctxSourceSlots = $componentCtx["sourceSlots"];
$mySourceSlots = [];
$slotName = "title";
foreach ($ctxSourceSlots as $i => $slot) {
  if ($slot[1] == $slotName) {
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
$html .= "</h1>";
if (!array_key_exists("_id4", $componentCtx["slotRenderers"])) $componentCtx["slotRenderers"]["_id4"] = function () use ($componentCtx, &$html){
$defaultSlotRender = function ($componentCtx) {
  $html = "";
  return $html;
};
$isInserted = false;
$ctxSourceSlots = $componentCtx["sourceSlots"];
$mySourceSlots = [];
$slotName = "content";
foreach ($ctxSourceSlots as $i => $slot) {
  if ($slot[1] == $slotName) {
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
call_user_func($componentCtx["slotRenderers"]["_id4"]);
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
if ((array_key_exists("class", $componentCtx["data"]) ? $componentCtx["data"]["class"] : null)) {
$html .= San::attrFilter('class', San::escapeHTML(San::_classFilter((array_key_exists("class", $componentCtx["data"]) ? $componentCtx["data"]["class"] : null))));
}
if ((array_key_exists("style", $componentCtx["data"]) ? $componentCtx["data"]["style"] : null)) {
$html .= San::attrFilter('style', San::escapeHTML(San::_styleFilter((array_key_exists("style", $componentCtx["data"]) ? $componentCtx["data"]["style"] : null))));
}
if ((array_key_exists("id", $componentCtx["data"]) ? $componentCtx["data"]["id"] : null)) {
$html .= San::attrFilter('id', San::escapeHTML((array_key_exists("id", $componentCtx["data"]) ? $componentCtx["data"]["id"] : null)));
}
$html .= ">";
if (!$noDataOutput) {
$html .= "<!--s-data:" . json_encode($componentCtx["data"]) . "-->";
}
$sourceSlots = [];
array_push($sourceSlots, [function ($componentCtx) {
  $html = "";
$html .= "<b>";
$html .= San::escapeHTML((array_key_exists("name", $componentCtx["data"]) ? $componentCtx["data"]["name"] : null));
$html .= "</b>";

  return $html;
}, "title"]);
array_push($sourceSlots, [function ($componentCtx) {
  $html = "";
if ((array_key_exists("num", $componentCtx["data"]) ? $componentCtx["data"]["num"] : null)>10000) {
$html .= "<h2>biiig</h2><p>";
$html .= San::escapeHTML((array_key_exists("num", $componentCtx["data"]) ? $componentCtx["data"]["num"] : null));
$html .= "</p>";

}
else if ((array_key_exists("num", $componentCtx["data"]) ? $componentCtx["data"]["num"] : null)>1000) {
$html .= "<h3>biig</h3><p>";
$html .= San::escapeHTML((array_key_exists("num", $componentCtx["data"]) ? $componentCtx["data"]["num"] : null));
$html .= "</p>";

}
else if ((array_key_exists("num", $componentCtx["data"]) ? $componentCtx["data"]["num"] : null)>100) {
$html .= "<h4>big</h4><p>";
$html .= San::escapeHTML((array_key_exists("num", $componentCtx["data"]) ? $componentCtx["data"]["num"] : null));
$html .= "</p>";

}
else {
$html .= "<h5>small</h5><p>";
$html .= San::escapeHTML((array_key_exists("num", $componentCtx["data"]) ? $componentCtx["data"]["num"] : null));
$html .= "</p>";

}

  return $html;
}, "content"]);
$html .= call_user_func("_id2", 
["hidden" => (array_key_exists("folderHidden", $componentCtx["data"]) ? $componentCtx["data"]["folderHidden"] : null)], true, $componentCtx, "x-folder", $sourceSlots);
$sourceSlots = null;
$html .= "</div>";
return $html;
};
return call_user_func("_id1", $data, $noDataOutput);
}; ?>