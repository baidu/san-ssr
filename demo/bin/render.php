#!/usr/bin/env php
<?php
include(__DIR__ . '/../dist/index.php');

$data = json_decode(file_get_contents(__DIR__ . "/../data.json"));
$noDataOutput = false;
$html = \demo\renderer\render($data, $noDataOutput);

echo $html;
