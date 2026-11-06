<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/../includes/sesion.php";
require_once __DIR__ . "/../config.php";

$metodo = $_SERVER['REQUEST_METHOD'];

// ----- Ver las guías (cualquiera puede verlas, para armar las pestañas) -----
if ($metodo === 'GET') {
    $consulta = $pdo->query("SELECT numero, titulo FROM unidades_formulario ORDER BY orden ASC, numero ASC");
    echo json_encode($consulta->fetchAll());
    exit;
}

// A partir de acá, todo es solo para administradores.
if (!esAdministrador()) {
    http_response_code(403);
    echo json_encode(["error" => "Solo un administrador puede hacer esto."]);
    exit;
}

// ----- Agregar una guía nueva -----
if ($metodo === 'POST') {
    $datos = json_decode(file_get_contents("php://input"), true);
    $titulo = trim(mb_substr((string)($datos['titulo'] ?? ''), 0, 100));
    if ($titulo === '') {
        http_response_code(400);
        echo json_encode(["error" => "Ponele un título a la guía."]);
        exit;
    }

    $siguiente = $pdo->query("SELECT COALESCE(MAX(numero), 0) + 1 AS n FROM unidades_formulario")->fetch()['n'];
    $siguienteOrden = $pdo->query("SELECT COALESCE(MAX(orden), 0) + 1 AS o FROM unidades_formulario")->fetch()['o'];

    $insertar = $pdo->prepare("INSERT INTO unidades_formulario (numero, titulo, orden) VALUES (?, ?, ?)");
    $insertar->execute([$siguiente, $titulo, $siguienteOrden]);

    echo json_encode(["numero" => (int) $siguiente, "titulo" => $titulo]);
    exit;
}

// ----- Eliminar una guía (?numero=X), junto con sus preguntas y respuestas -----
if ($metodo === 'DELETE') {
    $numero = $_GET['numero'] ?? null;
    if (!$numero) { http_response_code(400); echo json_encode(["error" => "Falta el número de guía"]); exit; }

    $pdo->prepare("DELETE FROM preguntas_formulario WHERE unidad = ?")->execute([$numero]);
    $pdo->prepare("DELETE FROM respuestas_formulario WHERE unidad = ?")->execute([$numero]);
    $pdo->prepare("DELETE FROM unidades_formulario WHERE numero = ?")->execute([$numero]);

    echo json_encode(["ok" => true]);
    exit;
}
