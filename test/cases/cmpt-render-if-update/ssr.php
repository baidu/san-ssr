<?php $render = function ($data, $noDataOutput) {
final class _
{
    public static $componentRenderers = [];
    private const HTML_ENTITY = [
        '&' => '&amp;',
        '<' => '&lt;',
        '>' => '&gt;',
        '"' => '&quot;',
        "'" => '&#39;'
    ];

    public static function objSpread($arr, $needSpread) {
        $obj = (object)[];
        foreach ($arr as $idx => $val) {
            if ($needSpread[$idx]) {
                foreach ($val as $subkey => $subvar) {
                    $obj->{$subkey} = $subvar;
                }
            } else {
                $obj->{$val[0]} = $val[1];
            }
        }
        return $obj;
    }

    public static function spread($arr, $needSpread) {
        $ret = [];
        foreach ($arr as $idx => $val) {
            if ($needSpread[$idx]) {
                foreach ($val as $subvar) array_push($ret, $subvar);
            } else {
                array_push($ret, $val);
            }
        }
        return $ret;
    }

    public static function extend($target, $source)
    {
        if (!$target) $target = (object)[];
        if ($source) {
            foreach ($source as $key => $val) {
                $target->{$key} = $val;
            }
        }
        return $target;
    }

    public static function each($array, $iter)
    {
        if (!$array) {
            return;
        }
        foreach ($array as $key => $val) {
            if ($iter($val, $key) === false) {
                break;
            }
        }
    }

    public static function contains($array, $value)
    {
        return in_array($value, $array);
    }

    public static function htmlFilterReplacer($c)
    {
        return _::HTML_ENTITY[$c];
    }

    public static function escapeHTML($source)
    {
        if (!$source) {
            return "";
        }
        if (is_string($source)) {
            return htmlspecialchars($source, ENT_QUOTES);
        }
        if (is_bool($source)) {
            return $source ? 'true' : 'false';
        }
        return strval($source);
    }

    public static function _classFilter($source)
    {
        if (is_array($source)) {
            return join(" ", $source);
        }
        return $source;
    }

    public static function _styleFilter($source)
    {
        return _::defaultStyleFilter($source);
    }

    public static function _xclassFilter($outer, $inner)
    {
        if (is_array($outer)) {
            $outer = join(" ", $outer);
        }
        if ($outer) {
            if ($inner) {
                return $inner . ' ' . $outer;
            }
            return $outer;
        }
        return $inner;
    }

    public static function _xstyleFilter($outer, $inner)
    {
        if ($outer) {
            $outer = _::defaultStyleFilter($outer);
        }
        if ($outer) {
            if ($inner) {
                return $inner . ';' . $outer;
            }
            return $outer;
        }
        return $inner;
    }

    public static function attrFilter($name, $value)
    {
        if (isset($value)) {
            return " " . $name . '="' . $value . '"';
        }
        return '';
    }

    public static function boolAttrFilter($name, $value)
    {
        return _::boolAttrTruthy($value) ? ' ' . $name : '';
    }

    private static function boolAttrTruthy($value) {
        if (is_string($value)) {
            return $value != '' && $value != 'false' && $value != '0';
        }
        return (boolean)$value;
    }

    public static function callFilter($ctx, $name, $args)
    {
        $filter = $ctx["proto"]["filters"][$name];
        // TODO this is
        if (is_callable($filter)) {
            return call_user_func_array($filter, $args);
        }
    }

    public static function defaultStyleFilter($source)
    {
        if (is_array($source) || is_object($source)) {
            $result = '';
            foreach ($source as $key => $val) {
                $result .= $key . ':' . $val . ';';
            }
            return $result;
        }
        return $source;
    }
}
function _id3($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {
$_id3Proto = [
"filters" => [

],
"computed" => [

],
"computedNames" => [

],
"tagName" => "ul"
];
$html = "";
$componentCtx = [
"proto" => $_id3Proto,
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
$html .= "<ul";
if ((isset($componentCtx["data"]->{"class"}) ? $componentCtx["data"]->{"class"} : null)) {
$html .= _::attrFilter('class', _::escapeHTML(_::_classFilter((isset($componentCtx["data"]->{"class"}) ? $componentCtx["data"]->{"class"} : null))));
}
if ((isset($componentCtx["data"]->{"style"}) ? $componentCtx["data"]->{"style"} : null)) {
$html .= _::attrFilter('style', _::escapeHTML(_::_styleFilter((isset($componentCtx["data"]->{"style"}) ? $componentCtx["data"]->{"style"} : null))));
}
if ((isset($componentCtx["data"]->{"id"}) ? $componentCtx["data"]->{"id"} : null)) {
$html .= _::attrFilter('id', _::escapeHTML((isset($componentCtx["data"]->{"id"}) ? $componentCtx["data"]->{"id"} : null)));
}
$html .= ">";
if (!$noDataOutput) {
$html .= "<!--s-data:" . json_encode($componentCtx["data"], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "-->";
}
$_id5 = (isset($componentCtx["data"]->{"list"}) ? $componentCtx["data"]->{"list"} : null);
if (is_array($_id5) || is_object($_id5)) {
foreach ($_id5 as $_id4 => $value) {
$componentCtx["data"]->_id4 = $_id4;
$componentCtx["data"]->item = $value;
$html .= "<li";
if ((isset($componentCtx["data"]->{"item"}) ? $componentCtx["data"]->{"item"} : null)) {
$html .= _::attrFilter('title', _::escapeHTML((isset($componentCtx["data"]->{"item"}) ? $componentCtx["data"]->{"item"} : null)));
}
$html .= ">";
$html .= _::escapeHTML((isset($componentCtx["data"]->{"item"}) ? $componentCtx["data"]->{"item"} : null));
$html .= "</li>";

}
}
$html .= "</ul>";
return $html;
};
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
$html .= _::attrFilter('class', _::escapeHTML(_::_classFilter((isset($componentCtx["data"]->{"class"}) ? $componentCtx["data"]->{"class"} : null))));
}
if ((isset($componentCtx["data"]->{"style"}) ? $componentCtx["data"]->{"style"} : null)) {
$html .= _::attrFilter('style', _::escapeHTML(_::_styleFilter((isset($componentCtx["data"]->{"style"}) ? $componentCtx["data"]->{"style"} : null))));
}
if ((isset($componentCtx["data"]->{"id"}) ? $componentCtx["data"]->{"id"} : null)) {
$html .= _::attrFilter('id', _::escapeHTML((isset($componentCtx["data"]->{"id"}) ? $componentCtx["data"]->{"id"} : null)));
}
$html .= ">";
if (!$noDataOutput) {
$html .= "<!--s-data:" . json_encode($componentCtx["data"], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "-->";
}
$_id7 = (isset($componentCtx["data"]->{"list"}) ? $componentCtx["data"]->{"list"} : null);
if (is_array($_id7) || is_object($_id7)) {
foreach ($_id7 as $_id6 => $value) {
$componentCtx["data"]->_id6 = $_id6;
$componentCtx["data"]->item = $value;
$html .= "<dl><dt";
if ((isset($componentCtx["data"]->{"item"}->{"name"}) ? $componentCtx["data"]->{"item"}->{"name"} : null)) {
$html .= _::attrFilter('title', _::escapeHTML((isset($componentCtx["data"]->{"item"}->{"name"}) ? $componentCtx["data"]->{"item"}->{"name"} : null)));
}
$html .= ">";
$html .= _::escapeHTML((isset($componentCtx["data"]->{"item"}->{"name"}) ? $componentCtx["data"]->{"item"}->{"name"} : null));
$html .= "</dt><dd>";
$sourceSlots = [];
$html .= call_user_func("_id3", 
(object)["list" => (isset($componentCtx["data"]->{"item"}->{"tels"}) ? $componentCtx["data"]->{"item"}->{"tels"} : null)], true, $componentCtx, "ui-tel", $sourceSlots);
$sourceSlots = null;
$html .= "</dd></dl>";

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
$html .= _::attrFilter('class', _::escapeHTML(_::_classFilter((isset($componentCtx["data"]->{"class"}) ? $componentCtx["data"]->{"class"} : null))));
}
if ((isset($componentCtx["data"]->{"style"}) ? $componentCtx["data"]->{"style"} : null)) {
$html .= _::attrFilter('style', _::escapeHTML(_::_styleFilter((isset($componentCtx["data"]->{"style"}) ? $componentCtx["data"]->{"style"} : null))));
}
if ((isset($componentCtx["data"]->{"id"}) ? $componentCtx["data"]->{"id"} : null)) {
$html .= _::attrFilter('id', _::escapeHTML((isset($componentCtx["data"]->{"id"}) ? $componentCtx["data"]->{"id"} : null)));
}
$html .= ">";
if (!$noDataOutput) {
$html .= "<!--s-data:" . json_encode($componentCtx["data"], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "-->";
}
if ((isset($componentCtx["data"]->{"cond"}) ? $componentCtx["data"]->{"cond"} : null)) {
$sourceSlots = [];
$html .= call_user_func("_id2", 
(object)["list" => (isset($componentCtx["data"]->{"persons"}) ? $componentCtx["data"]->{"persons"} : null)], true, $componentCtx, "ui-person", $sourceSlots);
$sourceSlots = null;

}
$html .= "</div>";
return $html;
};
return call_user_func("_id1", $data, $noDataOutput);
}; ?>