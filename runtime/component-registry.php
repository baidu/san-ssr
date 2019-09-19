<?php
class ComponentRegistry {
    public static $comps;
    public static function get($cid){
        return ComponentRegistry::$comps[$cid];
    }
}
