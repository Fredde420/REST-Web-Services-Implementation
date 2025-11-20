<?php
require_once __DIR__ . '/../../config/data_store.php';

header("Content-Type: application/json; charset=utf-8");

$username = isset($_GET['username']) ? $_GET['username'] : null;

if ($username === null || $username === '') {
    http_response_code(400);
    echo json_encode(['error' => 'username is required']);
    exit;
}

$students = load_json('students.json');

foreach ($students as $s) {
    if (isset($s['username']) && $s['username'] === $username) {
        echo json_encode([
            'username' => $username,
            'personnummer' => $s['personnummer']
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }
}

http_response_code(404);
echo json_encode(['error' => 'not found']);
