<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/../includes/sesion.php";
require_once __DIR__ . "/../config.php";

$metodo = $_SERVER['REQUEST_METHOD'];
$accion = $_GET['accion'] ?? '';

function datosPublicos($usuario) {
    return [
        "id" => $usuario['id'],
        "nombre" => $usuario['nombre'],
        "correo" => $usuario['correo'],
        "rol" => $usuario['rol'],
    ];
}

function iniciarSesionUsuario($usuario) {
    $_SESSION['usuario_id'] = $usuario['id'];
    $_SESSION['nombre'] = $usuario['nombre'];
    $_SESSION['correo'] = $usuario['correo'];
    $_SESSION['rol'] = $usuario['rol'];
}

// ----- ¿Quién está logueado? -----
if ($metodo === 'GET' && $accion === 'quien_soy') {
    if (!empty($_SESSION['usuario_id'])) {
        echo json_encode([
            "logueado" => true,
            "usuario" => [
                "id" => $_SESSION['usuario_id'],
                "nombre" => $_SESSION['nombre'],
                "correo" => $_SESSION['correo'],
                "rol" => $_SESSION['rol'],
            ],
        ]);
    } else {
        echo json_encode(["logueado" => false]);
    }
    exit;
}

// ----- Registro -----
if ($metodo === 'POST' && $accion === 'registrar') {
    $datos = json_decode(file_get_contents("php://input"), true) ?? [];
    $nombre = trim(mb_substr((string)($datos['nombre'] ?? ''), 0, 30));
    $correo = trim(mb_substr((string)($datos['correo'] ?? ''), 0, 60));
    $contrasena = (string)($datos['contrasena'] ?? '');

    if ($nombre === '' || $correo === '' || $contrasena === '') {
        http_response_code(400);
        echo json_encode(["error" => "Completá nombre, correo y contraseña."]);
        exit;
    }
    if (mb_strlen($contrasena) < 6) {
        http_response_code(400);
        echo json_encode(["error" => "La contraseña debe tener al menos 6 caracteres."]);
        exit;
    }

    $existe = $pdo->prepare("SELECT id FROM usuarios WHERE correo = ?");
    $existe->execute([$correo]);
    if ($existe->fetch()) {
        http_response_code(409);
        echo json_encode(["error" => "Ya existe una cuenta con ese correo."]);
        exit;
    }

    $esAdmin = $pdo->prepare("SELECT correo FROM admins_autorizados WHERE correo = ?");
    $esAdmin->execute([$correo]);
    $rol = $esAdmin->fetch() ? 'administrador' : 'alumno';

    $hash = password_hash($contrasena, PASSWORD_DEFAULT);
    $insertar = $pdo->prepare("INSERT INTO usuarios (nombre, correo, contrasena_hash, rol) VALUES (?, ?, ?, ?)");
    $insertar->execute([$nombre, $correo, $hash, $rol]);

    $usuario = [
        "id" => $pdo->lastInsertId(),
        "nombre" => $nombre,
        "correo" => $correo,
        "rol" => $rol,
    ];
    iniciarSesionUsuario($usuario);

    echo json_encode(["logueado" => true, "usuario" => $usuario]);
    exit;
}

// ----- Iniciar sesión -----
if ($metodo === 'POST' && $accion === 'iniciar_sesion') {
    $datos = json_decode(file_get_contents("php://input"), true) ?? [];
    $correo = trim((string)($datos['correo'] ?? ''));
    $contrasena = (string)($datos['contrasena'] ?? '');

    $consulta = $pdo->prepare("SELECT * FROM usuarios WHERE correo = ?");
    $consulta->execute([$correo]);
    $usuario = $consulta->fetch();

    if (!$usuario || !password_verify($contrasena, $usuario['contrasena_hash'])) {
        http_response_code(401);
        echo json_encode(["error" => "Correo o contraseña incorrectos."]);
        exit;
    }

    iniciarSesionUsuario($usuario);
    echo json_encode(["logueado" => true, "usuario" => datosPublicos($usuario)]);
    exit;
}

// ----- Cerrar sesión -----
if ($metodo === 'POST' && $accion === 'cerrar_sesion') {
    $_SESSION = [];
    session_destroy();
    echo json_encode(["ok" => true]);
    exit;
}

http_response_code(400);
echo json_encode(["error" => "Acción inválida."]);
