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

function limpiarNumerico($valor, $largo) {
    $valor = preg_replace('/[^0-9]/', '', (string)($valor ?? ''));
    return substr($valor, 0, $largo);
}

function obtenerPerfil($pdo, $id) {
    $consulta = $pdo->prepare("SELECT id, nombre, curso, correo, telefono, rol, avatar FROM usuarios WHERE id = ?");
    $consulta->execute([$id]);
    return $consulta->fetch();
}

// ----- Ver mi perfil -----
if ($metodo === 'GET') {
    echo json_encode(obtenerPerfil($pdo, $idUsuario));
    exit;
}

// ----- Guardar curso y teléfono. El nombre NO se toca acá: se fija al
// registrarse y solo un administrador puede corregirlo (vía api/alumnos.php),
// así el nombre siempre coincide con el que usa el admin para buscarte. -----
if ($metodo === 'PUT') {
    $datos = json_decode(file_get_contents("php://input"), true) ?? [];

    $curso    = mb_substr(trim((string)($datos['curso'] ?? '')), 0, 10);
    $telefono = limpiarNumerico($datos['telefono'] ?? '', 20);

    $consulta = $pdo->prepare("UPDATE usuarios SET curso=?, telefono=? WHERE id=?");
    $consulta->execute([$curso, $telefono, $idUsuario]);

    echo json_encode(obtenerPerfil($pdo, $idUsuario));
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);
