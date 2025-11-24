<?php
require_once __DIR__ . '/../../config/data_store.php';

header("Content-Type: application/json; charset=utf-8");

$course = isset($_GET['course_code']) ? $_GET['course_code'] : null;

if ($course === null || $course === '') {
    http_response_code(400);
    echo json_encode(['error' => 'course_code is required']);
    exit;
}

$modules = load_json('epok_modules.json');
$result = [];

foreach ($modules as $m) {
    if (isset($m['course_code']) && $m['course_code'] === $course) {
        $result[] = [
            'code' => $m['modul_code'],
            'name' => $m['modul_name']
        ];
    }
}

echo json_encode(
    [
        'course_code' => $course,
        'modules' => $result
    ],
    JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
);
