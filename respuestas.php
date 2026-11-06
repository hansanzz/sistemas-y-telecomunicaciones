<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/../config.php";

$metodo = $_SERVER['REQUEST_METHOD'];

// ----- Ver la respuesta de una unidad (?unidad=X) -----
if ($metodo === 'GET') {
    $unidad = $_GET['unidad'] ?? null;
    if (!$unidad) { http_response_code(400); echo json_encode(["error" => "Falta la unidad"]); exit; }

    $consulta = $pdo->prepare("SELECT * FROM respuestas_formulario WHERE unidad = ?");
    $consulta->execute([$unidad]);
    $fila = $consulta->fetch();

    if (!$fila) {
        // si la unidad todavía no tiene fila, la creamos vacía
        $crear = $pdo->prepare("INSERT INTO respuestas_formulario (unidad, texto) VALUES (?, '')");
        $crear->execute([$unidad]);
        $fila = ["id" => $pdo->lastInsertId(), "unidad" => $unidad, "texto" => ""];
    }
    echo json_encode($fila);
    exit;
}

// ----- Guardar/actualizar la respuesta de una unidad (?unidad=X) -----
if ($metodo === 'PUT') {
    $unidad = $_GET['unidad'] ?? null;
    if (!$unidad) { http_response_code(400); echo json_encode(["error" => "Falta la unidad"]); exit; }
    $datos = json_decode(file_get_contents("php://input"), true);
    $texto = $datos['texto'] ?? '';

    $consulta = $pdo->prepare("
        INSERT INTO respuestas_formulario (unidad, texto) VALUES (?, ?)
        ON DUPLICATE KEY UPDATE texto = VALUES(texto)
    ");
    $consulta->execute([$unidad, $texto]);
    echo json_encode(["ok" => true]);
    exit;
}
