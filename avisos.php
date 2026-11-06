<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/../includes/sesion.php";
require_once __DIR__ . "/../config.php";

$metodo = $_SERVER['REQUEST_METHOD'];

// ----- Ver los avisos (cualquiera puede leerlos, los más nuevos primero) -----
if ($metodo === 'GET') {
    $consulta = $pdo->query("SELECT id, titulo, texto, etiqueta, fecha FROM avisos ORDER BY id DESC");
    echo json_encode($consulta->fetchAll());
    exit;
}

// A partir de acá, todo es solo para administradores.
if (!esAdministrador()) {
    http_response_code(403);
    echo json_encode(["error" => "Solo un administrador puede hacer esto."]);
    exit;
}

// ----- Publicar un aviso nuevo -----
if ($metodo === 'POST') {
    $datos    = json_decode(file_get_contents("php://input"), true) ?? [];
    $titulo   = trim(mb_substr((string)($datos['titulo'] ?? ''), 0, 120));
    $texto    = trim(mb_substr((string)($datos['texto'] ?? ''), 0, 500));
    $etiqueta = (string)($datos['etiqueta'] ?? 'General');

    $etiquetasValidas = ['General', 'Importante', 'Recurso', 'Recordatorio'];
    if (!in_array($etiqueta, $etiquetasValidas, true)) {
        $etiqueta = 'General';
    }

    if ($titulo === '' || $texto === '') {
        http_response_code(400);
        echo json_encode(["error" => "Completá el título y el mensaje del aviso."]);
        exit;
    }

    $insertar = $pdo->prepare("INSERT INTO avisos (titulo, texto, etiqueta) VALUES (?, ?, ?)");
    $insertar->execute([$titulo, $texto, $etiqueta]);

    echo json_encode([
        "id" => $pdo->lastInsertId(),
        "titulo" => $titulo,
        "texto" => $texto,
        "etiqueta" => $etiqueta,
        "fecha" => date("Y-m-d H:i:s"),
    ]);
    exit;
}

// ----- Eliminar un aviso (?id=X) -----
if ($metodo === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(["error" => "Falta el id"]); exit; }
    $consulta = $pdo->prepare("DELETE FROM avisos WHERE id = ?");
    $consulta->execute([$id]);
    echo json_encode(["ok" => true]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);
