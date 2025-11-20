<?php
require_once __DIR__ . '/../../config/data_store.php';

header("Content-Type: application/json; charset=utf-8");

$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
    exit;
}

$required = ['personnummer', 'course_code', 'modul_code', 'date', 'grade'];

foreach ($required as $key) {
    if (!isset($input[$key]) || $input[$key] === '') {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing field: ' . $key
        ]);
        exit;
    }
}

$grade = strtoupper(trim($input['grade']));
if (!in_array($grade, ['U', 'G', 'VG'], true)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid grade']);
    exit;
}

$results = load_json('ladok_results.json');

$results[] = [
    'personnummer' => $input['personnummer'],
    'course_code'  => $input['course_code'],
    'modul_code'   => $input['modul_code'],
    'date'         => $input['date'],
    'grade'        => $grade,
    'created_at'   => date('Y-m-d H:i:s')
];

save_json('ladok_results.json', $results);

echo json_encode(['status' => 'registrerad'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
