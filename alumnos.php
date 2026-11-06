<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/../includes/sesion.php";
require_once __DIR__ . "/../config.php";

// Todo este endpoint es exclusivo del panel de Administradores.
if (!esAdministrador()) {
    http_response_code(403);
    echo json_encode(["error" => "Solo un administrador puede hacer esto."]);
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'];

// ----- Ver alumnos (todos, o filtrados con ?buscar=texto) -----
if ($metodo === 'GET') {
    if (!empty($_GET['buscar'])) {
        $termino = '%' . $_GET['buscar'] . '%';
        $consulta = $pdo->prepare("SELECT id, nombre, curso, correo, telefono FROM usuarios WHERE rol = 'alumno' AND nombre LIKE ? ORDER BY id DESC");
        $consulta->execute([$termino]);
    } else {
        $consulta = $pdo->query("SELECT id, nombre, curso, correo, telefono FROM usuarios WHERE rol = 'alumno' ORDER BY id DESC");
    }
    echo json_encode($consulta->fetchAll());
    exit;
}

// ----- Agregar alumno (el admin lo pre-carga con una contraseña provisoria;
// el alumno puede iniciar sesión con esa contraseña y después seguir usándola
// o pedirte que se la cambies). -----
if ($metodo === 'POST') {
    $datos = json_decode(file_get_contents("php://input"), true);
    $nombre = trim(mb_substr((string)($datos['nombre'] ?? ''), 0, 30));
    $correo = trim((string)($datos['correo'] ?? ''));
    $contrasena = (string)($datos['contrasena'] ?? '');

    if ($nombre === '' || $correo === '' || $contrasena === '') {
        http_response_code(400);
        echo json_encode(["error" => "Completá nombre, correo y una contraseña provisoria."]);
        exit;
    }
    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["error" => "El correo no es válido."]);
        exit;
    }

    $existe = $pdo->prepare("SELECT id FROM usuarios WHERE correo = ?");
    $existe->execute([$correo]);
    if ($existe->fetch()) {
        http_response_code(409);
        echo json_encode(["error" => "Ya existe una cuenta con ese correo."]);
        exit;
    }

    $hash = password_hash($contrasena, PASSWORD_DEFAULT);
    $insertar = $pdo->prepare("INSERT INTO usuarios (nombre, correo, contrasena_hash, rol) VALUES (?, ?, ?, 'alumno')");
    $insertar->execute([$nombre, $correo, $hash]);

    echo json_encode(["id" => $pdo->lastInsertId(), "nombre" => $nombre, "correo" => $correo]);
    exit;
}

// ----- Editar alumno: nombre, curso, teléfono (?id=X). El correo y la
// contraseña no se tocan acá para no romper el acceso del alumno. -----
if ($metodo === 'PUT') {
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(["error" => "Falta el id"]); exit; }
    $datos = json_decode(file_get_contents("php://input"), true);

    $nombre   = trim(mb_substr((string)($datos['nombre'] ?? ''), 0, 30));
    $curso    = trim(mb_substr((string)($datos['curso'] ?? ''), 0, 10));
    $telefono = preg_replace('/[^0-9]/', '', (string)($datos['telefono'] ?? ''));
    $telefono = substr($telefono, 0, 20);

    $consulta = $pdo->prepare("UPDATE usuarios SET nombre=?, curso=?, telefono=? WHERE id=? AND rol='alumno'");
    $consulta->execute([$nombre, $curso, $telefono, $id]);
    echo json_encode(["ok" => true]);
    exit;
}

// ----- Eliminar alumno (?id=X). Esto borra la cuenta por completo. -----
if ($metodo === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(["error" => "Falta el id"]); exit; }
    $consulta = $pdo->prepare("DELETE FROM usuarios WHERE id=? AND rol='alumno'");
    $consulta->execute([$id]);
    echo json_encode(["ok" => true]);
    exit;
}
