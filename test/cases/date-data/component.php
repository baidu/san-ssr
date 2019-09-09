<?php
namespace san\component\dateData;
require_once(dirname(__FILE__) . "/../../../src/runtime/san.php");
class extends Component {
    public static $filters = array(
        "year" => function ($date) {
            return $date->getFullYear();
        }
    );
    public static $template = "<div>" . "<b title=\"{{date|year}}\">{{date|year}}</b>" . "</div>";
}
