#!/usr/bin/env php
<?php
include('src/San.php');

$caseName = $argv[1];
$caseDir = "test/cases/" . $caseName;
include($caseDir . '/ssr.php');

$dataStr = file_get_contents($caseDir . "/data.json");
$data = json_decode($dataStr);
$noDataOutput = preg_match('/-ndo$/', $caseName);

echo $render($data, $noDataOutput);
