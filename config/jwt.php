<?php

$JWT_SECRET = "987654321";

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

function sign_jwt($header, $payload, $secret) {
    $data = base64url_encode(json_encode($header)) . "." .
            base64url_encode(json_encode($payload));
    return hash_hmac("sha256", $data, $secret, true);
}

function create_jwt($payload) {
    global $JWT_SECRET;

    $header = [
        "alg" => "HS256",
        "typ" => "JWT"
    ];

    $signature = sign_jwt($header, $payload, $JWT_SECRET);

    return base64url_encode(json_encode($header)) . "." .
           base64url_encode(json_encode($payload)) . "." .
           base64url_encode($signature);
}

function verify_jwt($jwt) {
    global $JWT_SECRET;

    $parts = explode(".", $jwt);
    if (count($parts) !== 3) return false;

    [$h64, $p64, $s64] = $parts;

    $header = json_decode(base64url_decode($h64), true);
    $payload = json_decode(base64url_decode($p64), true);

    if (!$header || !$payload) return false;
    if ($header['alg'] !== 'HS256') return false;

    $data = $h64 . "." . $p64;
    $expected = base64url_encode(
        hash_hmac("sha256", $data, $JWT_SECRET, true)
    );

    if (!hash_equals($expected, $s64)) {
        return false;
    }

    return $payload;
}
