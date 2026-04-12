<?php
require "../config/db.php";
require "../config/jwt.php";

$jwt = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$user = verify_jwt($jwt);
if (!$user) { http_response_code(401); exit; }

$referer = $_SERVER['HTTP_REFERER'] ?? '';
if (strpos($referer, 'dashboard.php') === false) {
    http_response_code(403);
    exit("Forbidden");
}

$res = $conn->query("SELECT id,username,role FROM users");
$data = [];
while ($row = $res->fetch_assoc()) {
    $data[] = $row;
}
echo json_encode($data);
