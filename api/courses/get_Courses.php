<?php
require_once __DIR__ . '/../../config/data_store.php';

header("Content-Type: application/json; charset=utf-8");

$assessments = load_json('assessments.json');

$courses = [];

foreach ($assessments as $a) {
    if (isset($a['course_code'])) {
        $courses[$a['course_code']] = true;
    }
}

$list = [];
foreach ($courses as $code => $dummy) {
    $list[] = ['code' => $code];
}

echo json_encode(
    ['courses' => $list],
    JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
);
