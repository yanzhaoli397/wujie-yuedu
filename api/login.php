<?php
require "../config/db.php";
require "../config/jwt.php";

$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'];
$password = $data['password'];

$sql = "SELECT * FROM users WHERE username='$username' AND password='$password'";
$res = $conn->query($sql);

if ($res->num_rows == 0) {
    http_response_code(401);
    echo "Login failed";
    exit;
}

$user = $res->fetch_assoc();

$token = create_jwt([
    "id" => $user['id'],
    "username" => $user['username'],
    "role" => $user['role']
]);

echo json_encode(["token"=>$token]);
