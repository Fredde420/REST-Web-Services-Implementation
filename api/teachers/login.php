<?php
require_once __DIR__ . '/../../config/data_store.php';

header("Content-Type: application/json; charset=utf-8");

/*
Exempel request-body:

{
  "username": "professor_dusseldorf",
  "password": "19500101-1111"
}
*/

$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode([
        'authenticated' => false,
        'message' => 'Invalid JSON'
    ]);
    exit;
}

$username = isset($input['username']) ? trim($input['username']) : '';
$password = isset($input['password']) ? trim($input['password']) : '';

if ($username === '' || $password === '') {
    http_response_code(400);
    echo json_encode([
        'authenticated' => false,
        'message' => 'username and password are required'
    ]);
    exit;
}

$teachers = load_json('teachers.json');

$found = null;

foreach ($teachers as $t) {
    if ($t['username'] === $username && $t['password'] === $password) {
        $found = $t;
        break;
    }
}

if ($found === null) {
    http_response_code(401);
    echo json_encode([
        'authenticated' => false,
        'message' => 'Invalid username or password'
    ]);
    exit;
}

echo json_encode([
    'authenticated' => true,
    'username' => $found['username'],
    'first_name' => $found['first_name'],
    'last_name' => $found['last_name']
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
