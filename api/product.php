<?php
require "../config/db.php";
require "../config/jwt.php";

$jwt = '';

if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $jwt = $_SERVER['HTTP_AUTHORIZATION'];
} elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $jwt = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
} elseif (isset($_GET['token'])) {
    $jwt = $_GET['token']; // ⭐ 教学用，关键
}

$user = verify_jwt($jwt);
if (!$user) {
    http_response_code(401);
    echo "Invalid JWT";
    exit;
}


/*
  教学用水平越权设计（刻意保留）：
  - 只校验是否登录
  - 不校验 seller_id 是否等于 JWT 中的用户 id
  - 不校验商品是否属于当前商家
*/

$action = $_GET['action'] ?? 'list';

if ($action === 'list') {

    // ✅ 要求必须传 seller_id（修正“默认看到全部商品”的问题）
    if (!isset($_GET['seller_id'])) {
        echo json_encode([]);
        exit;
    }

    $seller_id = intval($_GET['seller_id']);

    // ❌ 漏洞点：信任客户端传来的 seller_id
    $res = $conn->query("SELECT * FROM products WHERE owner_id = $seller_id");

    $data = [];
    while ($row = $res->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
    exit;
}

if ($action === 'update') {

    $id = intval($_POST['id']);
    $price = intval($_POST['price']);
    $stock = isset($_POST['stock']) ? intval($_POST['stock']) : null;
    $name = isset($_POST['name']) ? $_POST['name'] : null;

    /*
      ❌ 核心漏洞：
      - 仅根据商品 id 更新
      - 不校验该商品是否属于当前商家
    */

    $sql = "UPDATE products SET price = $price";

    if ($stock !== null) {
        $sql .= ", stock = $stock";
    }
    if ($name !== null) {
        $sql .= ", name = '$name'";
    }

    $sql .= " WHERE id = $id";

    $conn->query($sql);
    echo "ok";
    exit;
}
