<?php
namespace san\component\dateDataInitData;
$san = require("san");
$MyComponent = $san["defineComponent"](array(
    "filters" => array(
        "year" => function ($date) {
            return $date->getFullYear();
        }
    ),
    "template" => "<div>" . "<b title=\"{{date|year}}\">{{date|year}}</b>" . "</div>",
    "initData" => function () {
        return array(
            "date" => new \Ts2Php_Date(1983, 8, 3)
        );
    }
));
$exports = $module["exports"] = $MyComponent;
