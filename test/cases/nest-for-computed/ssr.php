<?php $render = function ($data, $noDataOutput) {
function _id16($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id16Proto = [
"filters" => [

],
"computed" => [
"forms" => function ($componentCtx) {
            const cates = (isset($componentCtx["data"]->{"cates"}) ? $componentCtx["data"]->{"cates"} : null)
            const formLen = (isset($componentCtx["data"]->{"formLen"}) ? $componentCtx["data"]->{"formLen"} : null)

            const result = {}
            if (cates instanceof Array) {
                let start = 1
                for (let i = 0; i < cates.length; i++) {
                    result[cates[i]] = []
                    for (let j = 0; j < formLen; j++) {
                        result[cates[i]].push(start++)
                    }
                }
            }

            return result
        }
],
"computedNames" => [
"forms"
],
"tagName" => "form"
];
$html = "";
$componentCtx = [
"proto" => $_id16Proto,
"sourceSlots" => $sourceSlots,
"data" => $data ? $data : (object)["formLen" => 3,"forms" => (object)[]],
"owner" => $parentCtx,
"slotRenderers" => []
];
if ($data) {
$componentCtx["data"]->formLen = isset($componentCtx["data"]->formLen) ? $componentCtx["data"]->formLen : 3;
$componentCtx["data"]->forms = isset($componentCtx["data"]->forms) ? $componentCtx["data"]->forms : (object)[];
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
$_id18 = (isset($componentCtx["data"]->{"cates"}) ? $componentCtx["data"]->{"cates"} : null);
if (is_array($_id18) || is_object($_id18)) {
foreach ($_id18 as $_id17 => $value) {
$componentCtx["data"]->_id17 = $_id17;
$componentCtx["data"]->cate = $value;
$html .= "<fieldset>";
$_id20 = (isset($componentCtx["data"]->{"forms"}->{(isset($componentCtx["data"]->{"cate"}) ? $componentCtx["data"]->{"cate"} : null)}) ? $componentCtx["data"]->{"forms"}->{(isset($componentCtx["data"]->{"cate"}) ? $componentCtx["data"]->{"cate"} : null)} : null);
if (is_array($_id20) || is_object($_id20)) {
foreach ($_id20 as $_id19 => $value) {
$componentCtx["data"]->_id19 = $_id19;
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
return call_user_func("_id16", $data, $noDataOutput);
}; ?>