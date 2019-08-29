<?php
final class San
{
    public static $componentRenderers = [];
    private const HTML_ENTITY = [
        '&' => '&amp;',
        '<' => '&lt;',
        '>' => '&gt;',
        '"' => '&quot;',
        "'" => '&#39;'
    ];

    public static function extend(&$target, $source)
    {
        if ($source) {
            foreach ($source as $key => $val) {
                $target[$key] = $val;
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
        return San::HTML_ENTITY[$c];
    }

    public static function escapeHTML($source)
    {
        if (!$source) {
            return "";
        }
        if (is_string($source)) {
            return htmlspecialchars($source, ENT_QUOTES);
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
        return San::defaultStyleFilter($source);
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
            $outer = San::defaultStyleFilter($outer);
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
        if ($value) {
            return " " . $name . '="' . $value . '"';
        }
        return '';
    }

    public static function boolAttrFilter($name, $value)
    {
        if ($value && $value != 'false' && $value != '0') {
            return ' ' . $name;
        }
        return '';
    }

    public static function callFilter($ctx, $name, $args)
    {
        $filter = $ctx["proto"]["filters"][name];
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