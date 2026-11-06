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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit;
}

if (empty($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["error" => "No se recibió ninguna imagen."]);
    exit;
}

$archivo = $_FILES['foto'];

// Límite de tamaño: 4 MB
if ($archivo['size'] > 4 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(["error" => "La imagen no puede pesar más de 4 MB."]);
    exit;
}

// Validamos que sea realmente una imagen (no solo confiar en el nombre/extensión)
$permitidos = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
$info = @getimagesize($archivo['tmp_name']);
if ($info === false || !isset($permitidos[$info['mime']])) {
    http_response_code(400);
    echo json_encode(["error" => "El archivo tiene que ser una imagen JPG, PNG o WEBP."]);
    exit;
}

$carpeta = __DIR__ . "/../uploads/avatars";
if (!is_dir($carpeta)) {
    mkdir($carpeta, 0755, true);
}

// Borramos cualquier foto anterior de este usuario (puede tener otra extensión)
foreach (glob($carpeta . "/usuario_{$idUsuario}.*") as $viejo) {
    unlink($viejo);
}

$extension = $permitidos[$info['mime']];
$nombreArchivo = "usuario_{$idUsuario}.{$extension}";

if (!move_uploaded_file($archivo['tmp_name'], "{$carpeta}/{$nombreArchivo}")) {
    http_response_code(500);
    echo json_encode(["error" => "No se pudo guardar la imagen en el servidor."]);
    exit;
}

$rutaPublica = "uploads/avatars/{$nombreArchivo}";

$consulta = $pdo->prepare("UPDATE usuarios SET avatar = ? WHERE id = ?");
$consulta->execute([$rutaPublica, $idUsuario]);

echo json_encode(["ok" => true, "avatar" => $rutaPublica]);
