<?php
require "../config/db.php";
require "../config/jwt.php";

$jwt = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$user = verify_jwt($jwt);
if (!$user) { http_response_code(401); exit; }

/*
 IDOR：
 - 根据传入 id 查询
 - 不判断是否为当前用户
*/
$id = $_GET['id'];

$res = $conn->query("SELECT id,username,role FROM users WHERE id=$id");
echo json_encode($res->fetch_assoc());
