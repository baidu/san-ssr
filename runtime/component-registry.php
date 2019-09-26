<?php
class ComponentRegistry {
    public static $comps = [];
    public static function has($cid){
        return array_key_exists($cid, ComponentRegistry::$comps);
    }
    public static function get($cid){
        return ComponentRegistry::$comps[$cid];
    }
}
