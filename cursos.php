<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/../config.php";

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $consulta = $pdo->query("SELECT * FROM cursos ORDER BY id DESC");
    echo json_encode($consulta->fetchAll());
    exit;
}

if ($metodo === 'POST') {
    $datos = json_decode(file_get_contents("php://input"), true);
    $consulta = $pdo->prepare("INSERT INTO cursos (titulo, url) VALUES (?, ?)");
    $consulta->execute([$datos['titulo'] ?? '', $datos['url'] ?? '']);
    echo json_encode(["id" => $pdo->lastInsertId()]);
    exit;
}

if ($metodo === 'PUT') {
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(["error" => "Falta el id"]); exit; }
    $datos = json_decode(file_get_contents("php://input"), true);
    $consulta = $pdo->prepare("UPDATE cursos SET titulo=?, url=? WHERE id=?");
    $consulta->execute([$datos['titulo'] ?? '', $datos['url'] ?? '', $id]);
    echo json_encode(["ok" => true]);
    exit;
}

if ($metodo === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(["error" => "Falta el id"]); exit; }
    $consulta = $pdo->prepare("DELETE FROM cursos WHERE id=?");
    $consulta->execute([$id]);
    echo json_encode(["ok" => true]);
    exit;
}
