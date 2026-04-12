<?php
require "../config/db.php";
require "../config/jwt.php";

$jwt = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$user = verify_jwt($jwt);
if (!$user) { http_response_code(401); exit; }

$id = $_GET['id'];

$res = $conn->query("SELECT * FROM orders WHERE id=$id");
echo json_encode($res->fetch_assoc());
