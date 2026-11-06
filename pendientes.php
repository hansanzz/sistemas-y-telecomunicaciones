<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/../config.php";

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $consulta = $pdo->query("SELECT * FROM pendientes ORDER BY id ASC");
    echo json_encode($consulta->fetchAll());
    exit;
}

if ($metodo === 'POST') {
    $datos = json_decode(file_get_contents("php://input"), true);
    $consulta = $pdo->prepare("INSERT INTO pendientes (texto) VALUES (?)");
    $consulta->execute([$datos['texto'] ?? 'Nuevo pendiente...']);
    echo json_encode(["id" => $pdo->lastInsertId()]);
    exit;
}

if ($metodo === 'PUT') {
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(["error" => "Falta el id"]); exit; }
    $datos = json_decode(file_get_contents("php://input"), true);
    $consulta = $pdo->prepare("UPDATE pendientes SET texto=? WHERE id=?");
    $consulta->execute([$datos['texto'] ?? '', $id]);
    echo json_encode(["ok" => true]);
    exit;
}

if ($metodo === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(["error" => "Falta el id"]); exit; }
    $consulta = $pdo->prepare("DELETE FROM pendientes WHERE id=?");
    $consulta->execute([$id]);
    echo json_encode(["ok" => true]);
    exit;
}
