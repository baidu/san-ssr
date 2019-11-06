<?php
final class _
{
    public static $HTML_ENTITY;
  
    public static function data($ctx, $seq = []) {
        $data = $ctx->data;
        foreach ($seq as $name) {
            if (is_array($data)) {
                if (isset($data[$name])) $data = $data[$name];
                else return null;
            } else {
                if (isset($data->$name)) $data = $data->$name;
                else return null;
            }
        }
        return $data;
    }

    public static function setDefaultData($ctx) {
      $data = $ctx->data;
      $inst = $ctx->instance;

      if (!method_exists($inst, 'initData')) return;

      $initData = $inst->initData();
      foreach ($initData as $key => $val) {
          if (isset($data->$key)) continue;
          $data->$key = $val;
      }
      return $data;
    }

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
        return _::$HTML_ENTITY[$c];
    }

    // JavaScript toString Implementation
    public static function toString($source) {
        if (!isset($source)) {
            return "undefined";
        }
        if (is_string($source)) {
            return $source;
        }
        if (is_bool($source)) {
            return $source ? 'true' : 'false';
        }
        if (is_array($source)) {
            $arr = [];
            foreach ($source as $item) array_push(_::toString($item));
            return join(",", $arr);
        }
        if (is_object($source)) {
            return _::json_encode($source);
        }
        return strval($source);
    }

    public static function escapeHTML($source)
    {
        if (!isset($source)) {
            return "";
        }
        $str = _::toString($source);
        return htmlspecialchars($str, ENT_QUOTES);
    }

    public static function json_encode ($obj) {
        return json_encode($obj, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
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
        return _::stringifyStyles($source);
    }

    public static function _xclassFilter($outer, $inner)
    {
        if (is_array($outer)) {
            $outer = join(" ", $outer);
        }
        if ($outer) {
            return $inner ? $inner . ' ' . $outer : $outer;
        }
        return $inner;
    }

    public static function _xstyleFilter($outer, $inner)
    {
        if ($outer) {
            $outer = _::stringifyStyles($outer);
            return $inner ? $inner . ';' . $outer : $outer;
        }
        return $inner;
    }

    public static function attrFilter($name, $value)
    {
        if (!isset($value)) {
            $value = "";
        }

        return " " . $name . '="' . $value . '"';
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

    public static function getClassByCtx($ctx) {
        $cid = $ctx->sanssrCid;
        if (\__NSPREFIX__runtime\ComponentRegistry::has($cid)) {
            return \__NSPREFIX__runtime\ComponentRegistry::get($cid);
        }
        return null;
    }

    public static function callFilter($ctx, $name, $args)
    {
        $cls = _::getClassByCtx($ctx);
        $func = $cls::$filters[$name];
        if (is_callable($func)) {
            return call_user_func_array($func, $args);
        }
    }

    public static function createComponent (&$ctx) {
        $cls = _::getClassByCtx($ctx);
        if (!class_exists($cls)) {
          $cls = '\__NSPREFIX__runtime\SanComponent';
        }
        $obj = new $cls();
        $obj->data = new SanData($ctx);
        return $obj;
    }

    public static function callComputed($ctx, $name)
    {
        $cls = _::getClassByCtx($ctx);
        $func = $cls::$computed[$name];
        if (is_callable($func)) {
            $result = call_user_func($func, $ctx->instance);
            return is_array($result) ? (object)$result : $result;
        }
    }

    public static function stringifyStyles($source)
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

_::$HTML_ENTITY = [
    '&' => '&amp;',
    '<' => '&lt;',
    '>' => '&gt;',
    '"' => '&quot;',
    "'" => '&#39;'
];