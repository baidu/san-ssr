<?php
require_once(__DIR__ . '/../../../runtime/Ts2Php_Helper.php');

function data() {
    return (object)[
        "date" => new Ts2Php_Date(Ts2Php_Date::parse("1983-09-02T16:00:00.000Z"))
    ];
}
