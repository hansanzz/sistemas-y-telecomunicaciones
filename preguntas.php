<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/../config.php";

$metodo = $_SERVER['REQUEST_METHOD'];

// ----- Ver preguntas de una unidad (?unidad=X) -----
if ($metodo === 'GET') {
    $unidad = $_GET['unidad'] ?? null;
    if ($unidad !== null) {
        $consulta = $pdo->prepare("SELECT * FROM preguntas_formulario WHERE unidad = ? ORDER BY orden ASC, id ASC");
        $consulta->execute([$unidad]);
    } else {
        $consulta = $pdo->query("SELECT * FROM preguntas_formulario ORDER BY unidad ASC, orden ASC, id ASC");
    }
    echo json_encode($consulta->fetchAll());
    exit;
}

// ----- Agregar pregunta (a una unidad) -----
if ($metodo === 'POST') {
    $datos = json_decode(file_get_contents("php://input"), true);
    $unidad = $datos['unidad'] ?? null;
    if (!$unidad) { http_response_code(400); echo json_encode(["error" => "Falta la unidad"]); exit; }

    // siguiente número de orden dentro de esa unidad
    $consultaOrden = $pdo->prepare("SELECT COALESCE(MAX(orden), 0) + 1 AS siguiente FROM preguntas_formulario WHERE unidad = ?");
    $consultaOrden->execute([$unidad]);
    $siguiente = $consultaOrden->fetch()['siguiente'];

    $consulta = $pdo->prepare("INSERT INTO preguntas_formulario (unidad, orden, texto, completada) VALUES (?, ?, ?, 0)");
    $consulta->execute([$unidad, $siguiente, $datos['texto'] ?? 'Nueva pregunta...']);
    echo json_encode(["id" => $pdo->lastInsertId()]);
    exit;
}

// ----- Editar pregunta: texto y/o completada (?id=X) -----
if ($metodo === 'PUT') {
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(["error" => "Falta el id"]); exit; }
    $datos = json_decode(file_get_contents("php://input"), true);

    if (array_key_exists('completada', $datos) && !array_key_exists('texto', $datos)) {
        // solo se está marcando/desmarcando como completada
        $consulta = $pdo->prepare("UPDATE preguntas_formulario SET completada=? WHERE id=?");
        $consulta->execute([$datos['completada'] ? 1 : 0, $id]);
    } else {
        $consulta = $pdo->prepare("UPDATE preguntas_formulario SET texto=?, completada=? WHERE id=?");
        $consulta->execute([
            $datos['texto'] ?? '',
            isset($datos['completada']) ? ($datos['completada'] ? 1 : 0) : 0,
            $id
        ]);
    }
    echo json_encode(["ok" => true]);
    exit;
}

// ----- Eliminar pregunta (?id=X) -----
if ($metodo === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(["error" => "Falta el id"]); exit; }
    $consulta = $pdo->prepare("DELETE FROM preguntas_formulario WHERE id=?");
    $consulta->execute([$id]);
    echo json_encode(["ok" => true]);
    exit;
}
