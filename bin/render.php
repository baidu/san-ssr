#!/usr/bin/env php
<?php
$caseName = $argv[1];
$caseDir = "test/cases/" . $caseName;
include($caseDir . '/ssr.php');

$dataStr = file_get_contents($caseDir . "/data.json");
$data = json_decode($dataStr);

$noDataOutput = preg_match('/-ndo$/', $caseName);
$renderFunc = '\\san\\renderer\\' . dashesToCamelCase($caseName) . '\\render';

echo $renderFunc($data, $noDataOutput);

function dashesToCamelCase($string, $capitalizeFirstCharacter = false) {
    $str = str_replace(' ', '', ucwords(str_replace('-', ' ', $string)));
    if (!$capitalizeFirstCharacter) {
        $str[0] = strtolower($str[0]);
    }
    return $str;
}
