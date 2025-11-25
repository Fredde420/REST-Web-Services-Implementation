<?php
require_once __DIR__ . '/../../config/data_store.php';

header("Content-Type: application/json; charset=utf-8");

$course = isset($_GET['course_code']) ? $_GET['course_code'] : null;

if ($course === null || $course === '') {
    http_response_code(400);
    echo json_encode(['error' => 'course_code is required']);
    exit;
}

$assessments = load_json('assessments.json');

$assignments = [];

foreach ($assessments as $a) {
    if (
        isset($a['course_code'], $a['assignment']) &&
        $a['course_code'] === $course
    ) {
        $assignments[$a['assignment']] = true;
    }
}

$list = [];
foreach ($assignments as $name => $dummy) {
    $list[] = ['name' => $name];
}

echo json_encode(
    [
        'course_code' => $course,
        'assignments' => $list
    ],
    JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
);
