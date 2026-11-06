<?php
// Datos de conexión por defecto de WAMP: usuario "root" sin contraseña.
// Si vos le pusiste contraseña a MySQL en WAMP, cambiala acá abajo.
$host    = "localhost";
$bd      = "sistemas_telecom";
$usuario = "root";
$clave   = "";

$dsn = "mysql:host=$host;dbname=$bd;charset=utf8mb4";

$opciones = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $usuario, $clave, $opciones);
} catch (PDOException $error) {
    http_response_code(500);
    header("Content-Type: application/json; charset=utf-8");
    die(json_encode(["error" => "No se pudo conectar a la base de datos: " . $error->getMessage()]));
}
