<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/../includes/sesion.php";
require_once __DIR__ . "/../config.php";

if (empty($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Tenés que iniciar sesión."]);
    exit;
}
$idUsuario = $_SESSION['usuario_id'];

$metodo = $_SERVER['REQUEST_METHOD'];

// ----- Ver mis notas -----
if ($metodo === 'GET') {
    $consulta = $pdo->prepare("SELECT id, titulo, texto FROM notas WHERE usuario_id = ? ORDER BY id ASC");
    $consulta->execute([$idUsuario]);
    echo json_encode($consulta->fetchAll());
    exit;
}

// ----- Agregar una nota mía -----
if ($metodo === 'POST') {
    $datos = json_decode(file_get_contents("php://input"), true);
    $consulta = $pdo->prepare("INSERT INTO notas (usuario_id, titulo, texto) VALUES (?, ?, ?)");
    $consulta->execute([
        $idUsuario,
        $datos['titulo'] ?? 'Nueva nota',
        $datos['texto'] ?? ''
    ]);
    echo json_encode(["id" => $pdo->lastInsertId()]);
    exit;
}

// ----- Editar una nota mía (?id=X) -----
if ($metodo === 'PUT') {
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(["error" => "Falta el id"]); exit; }
    $datos = json_decode(file_get_contents("php://input"), true);
    // El "AND usuario_id = ?" evita que alguien edite una nota ajena
    // aunque adivine el id.
    $consulta = $pdo->prepare("UPDATE notas SET titulo=?, texto=? WHERE id=? AND usuario_id=?");
    $consulta->execute([$datos['titulo'] ?? '', $datos['texto'] ?? '', $id, $idUsuario]);
    echo json_encode(["ok" => true]);
    exit;
}

// ----- Eliminar una nota mía (?id=X) -----
if ($metodo === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(["error" => "Falta el id"]); exit; }
    $consulta = $pdo->prepare("DELETE FROM notas WHERE id=? AND usuario_id=?");
    $consulta->execute([$id, $idUsuario]);
    echo json_encode(["ok" => true]);
    exit;
}
