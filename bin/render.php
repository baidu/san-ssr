#!/usr/bin/env php
<?php
$caseName = $argv[1];
$caseDir = "test/cases/" . $caseName;
include($caseDir . '/ssr.php');

$data = getData($caseDir);

$noDataOutput = preg_match('/-ndo$/', $caseName);
$renderFunc = '\\san\\' . dashesToCamelCase($caseName) . '\\renderer\\render';

echo $renderFunc($data, $noDataOutput);

function dashesToCamelCase($string, $capitalizeFirstCharacter = false) {
    $str = str_replace(' ', '', ucwords(str_replace('-', ' ', $string)));
    if (!$capitalizeFirstCharacter) {
        $str[0] = strtolower($str[0]);
    }
    return $str;
}

function getData($caseDir) {
    $dataFile = $caseDir . '/data.php';
    if (file_exists($dataFile)) {
        require_once($dataFile);
        return data();
    }
    $dataStr = file_get_contents($caseDir . "/data.json");
    return json_decode($dataStr);
}
