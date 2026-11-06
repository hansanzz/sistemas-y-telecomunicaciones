<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/../includes/sesion.php";
require_once __DIR__ . "/../config.php";

$metodo = $_SERVER['REQUEST_METHOD'];

// ----- Ver los tutoriales (cualquiera puede leerlos) -----
if ($metodo === 'GET') {
    $consulta = $pdo->query("SELECT id, titulo, texto FROM tutoriales ORDER BY orden ASC, id ASC");
    echo json_encode($consulta->fetchAll());
    exit;
}

// A partir de acá, todo es solo para administradores.
if (!esAdministrador()) {
    http_response_code(403);
    echo json_encode(["error" => "Solo un administrador puede hacer esto."]);
    exit;
}

// ----- Agregar un tutorial nuevo -----
if ($metodo === 'POST') {
    $datos = json_decode(file_get_contents("php://input"), true);
    $titulo = trim(mb_substr((string)($datos['titulo'] ?? 'Nuevo tutorial'), 0, 150));
    $texto  = trim((string)($datos['texto'] ?? 'Escribí acá el contenido de este tutorial...'));

    $siguienteOrden = $pdo->query("SELECT COALESCE(MAX(orden), 0) + 1 AS o FROM tutoriales")->fetch()['o'];

    $insertar = $pdo->prepare("INSERT INTO tutoriales (titulo, texto, orden) VALUES (?, ?, ?)");
    $insertar->execute([$titulo, $texto, $siguienteOrden]);

    echo json_encode(["id" => $pdo->lastInsertId(), "titulo" => $titulo, "texto" => $texto]);
    exit;
}

// ----- Editar un tutorial (?id=X) -----
if ($metodo === 'PUT') {
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(["error" => "Falta el id"]); exit; }
    $datos = json_decode(file_get_contents("php://input"), true);

    $titulo = trim(mb_substr((string)($datos['titulo'] ?? ''), 0, 150));
    $texto  = trim((string)($datos['texto'] ?? ''));

    $consulta = $pdo->prepare("UPDATE tutoriales SET titulo=?, texto=? WHERE id=?");
    $consulta->execute([$titulo, $texto, $id]);
    echo json_encode(["ok" => true]);
    exit;
}

// ----- Eliminar un tutorial (?id=X) -----
if ($metodo === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(["error" => "Falta el id"]); exit; }
    $pdo->prepare("DELETE FROM tutoriales WHERE id = ?")->execute([$id]);
    echo json_encode(["ok" => true]);
    exit;
}
