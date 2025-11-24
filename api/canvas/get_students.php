<?php
require_once __DIR__ . '/../../config/data_store.php';

header("Content-Type: application/json; charset=utf-8");

$course = isset($_GET['course_code']) ? $_GET['course_code'] : null;
$assignment = isset($_GET['assignment']) ? $_GET['assignment'] : null;

if ($course === null || $course === '' || $assignment === null || $assignment === '') {
    http_response_code(400);
    echo json_encode(['error' => 'course_code and assignment are required']);
    exit;
}

$assessments = load_json('assessments.json');
$students = load_json('students.json');

$result = [];

foreach ($assessments as $a) {
    if (
        $a['course_code'] === $course &&
        $a['assignment'] === $assignment
    ) {
        foreach ($students as $s) {
            if ($s['username'] === $a['username']) {
                $result[] = [
                    'username'   => $s['username'],
                    'first_name' => $s['first_name'],
                    'last_name'  => $s['last_name'],
                    'remark'     => isset($a['remark']) ? $a['remark'] : null
                ];
            }
        }
    }
}

echo json_encode(
    [
        'course_code' => $course,
        'assignment'  => $assignment,
        'students'    => $result
    ],
    JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
);
