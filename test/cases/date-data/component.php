<?php
namespace san\component\dateData;
require_once(dirname(__FILE__) . "/../../../src/runtime/san.php");
$MyComponent = \san\runtime\defineComponent(array(
    "filters" => array(
        "year" => function ($date) {
            return $date->getFullYear();
        }
    ),
    "template" => "<div>" . "<b title=\"{{date|year}}\">{{date|year}}</b>" . "</div>"
));
