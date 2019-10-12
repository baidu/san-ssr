#!/usr/bin/env php
<?php
include('./ssr.php');

$data = json_decode(file_get_contents("./data.json"));
$noDataOutput = false;
$html = \san\renderer\render($data, $noDataOutput);

echo $html;
