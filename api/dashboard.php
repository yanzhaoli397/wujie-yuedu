<?php
require "../config/db.php";
require "../config/jwt.php";

$jwt = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$user = verify_jwt($jwt);

if (!$user) {
    http_response_code(401);
    exit("Not login");
}

if ($user['role'] !== 'admin') {
    http_response_code(403);
    exit("Not admin");
}

$res = $conn->query("SELECT id,username,role FROM users");

$data = [];
while ($row = $res->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
