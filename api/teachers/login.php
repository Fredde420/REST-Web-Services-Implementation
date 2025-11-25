<?php
require_once __DIR__ . '/../../config/data_store.php';

header("Content-Type: application/json; charset=utf-8");

/*
Förväntad request-body (JSON):

{
  "username": "professor_dusseldorf",
  "password": "19500101-1111"
}
*/

$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    echo json_encode([
        'authenticated' => false,
        'message' => 'Invalid JSON'
    ]);
    exit;
}

$username = isset($input['username']) ? trim($input['username']) : '';
$password = isset($input['password']) ? trim($input['password']) : '';

if ($username === '' || $password === '') {
    echo json_encode([
        'authenticated' => false,
        'message' => 'username and password are required'
    ]);
    exit;
}

// Lärare lagras i data/teachers.json
$teachers = load_json('teachers.json');

$found = null;

foreach ($teachers as $t) {
    if (
        isset($t['username'], $t['password']) &&
        $t['username'] === $username &&
        $t['password'] === $password
    ) {
        $found = $t;
        break;
    }
}

// Misslyckad inloggning → authenticated=false, men vi låter HTTP-koden vara 200
if ($found === null) {
    echo json_encode([
        'authenticated' => false,
        'message' => 'Ogiltigt användarnamn eller lösenord.'
    ]);
    exit;
}

// Lyckad inloggning
echo json_encode([
    'authenticated' => true,
    'username' => $found['username'],
    'first_name' => $found['first_name'],
    'last_name' => $found['last_name']
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
