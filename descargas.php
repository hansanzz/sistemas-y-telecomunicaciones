<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/../includes/sesion.php";
require_once __DIR__ . "/../config.php";

$metodo = $_SERVER['REQUEST_METHOD'];

// ----- Ver los archivos (cualquiera puede verlos y descargarlos) -----
if ($metodo === 'GET') {
    $consulta = $pdo->query("SELECT id, titulo, descripcion, archivo_original, ruta, tamano, fecha FROM descargas ORDER BY id DESC");
    echo json_encode($consulta->fetchAll());
    exit;
}

// A partir de acá, todo es solo para administradores.
if (!esAdministrador()) {
    http_response_code(403);
    echo json_encode(["error" => "Solo un administrador puede hacer esto."]);
    exit;
}

// ----- Subir un archivo nuevo (formulario con archivo, no JSON) -----
if ($metodo === 'POST') {
    $titulo      = trim(mb_substr((string)($_POST['titulo'] ?? ''), 0, 150));
    $descripcion = trim(mb_substr((string)($_POST['descripcion'] ?? ''), 0, 300));

    if ($titulo === '') {
        http_response_code(400);
        echo json_encode(["error" => "Ponele un título al archivo."]);
        exit;
    }

    if (empty($_FILES['archivo'])) {
        http_response_code(400);
        echo json_encode(["error" => "No se recibió ningún archivo."]);
        exit;
    }

    $archivo = $_FILES['archivo'];

    // Si el archivo es más grande de lo que permite php.ini, PHP avisa con estos códigos.
    if ($archivo['error'] === UPLOAD_ERR_INI_SIZE || $archivo['error'] === UPLOAD_ERR_FORM_SIZE) {
        http_response_code(400);
        echo json_encode(["error" => "El archivo es demasiado grande para el servidor (revisá upload_max_filesize en php.ini)."]);
        exit;
    }
    if ($archivo['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["error" => "No se pudo recibir el archivo. Probá de nuevo."]);
        exit;
    }

    // Límite de tamaño: 10 MB
    if ($archivo['size'] > 10 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(["error" => "El archivo no puede pesar más de 10 MB."]);
        exit;
    }

    // Solo dejamos subir tipos de archivo seguros. NUNCA .php u otros que se puedan ejecutar.
    $permitidas = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'zip', 'txt', 'png', 'jpg', 'jpeg'];
    $original   = basename((string)$archivo['name']);
    $extension  = strtolower(pathinfo($original, PATHINFO_EXTENSION));
    if (!in_array($extension, $permitidas, true)) {
        http_response_code(400);
        echo json_encode(["error" => "Tipo de archivo no permitido. Podés subir: " . implode(", ", $permitidas) . "."]);
        exit;
    }

    $carpeta = __DIR__ . "/../uploads/descargas";
    if (!is_dir($carpeta)) {
        mkdir($carpeta, 0755, true);
    }

    // Le ponemos un nombre aleatorio para que no se pisen archivos con el mismo nombre.
    $nombreGuardado = bin2hex(random_bytes(8)) . "." . $extension;
    if (!move_uploaded_file($archivo['tmp_name'], "$carpeta/$nombreGuardado")) {
        http_response_code(500);
        echo json_encode(["error" => "No se pudo guardar el archivo en el servidor."]);
        exit;
    }

    $ruta = "uploads/descargas/$nombreGuardado";
    $original = mb_substr($original, 0, 200);

    $insertar = $pdo->prepare("INSERT INTO descargas (titulo, descripcion, archivo_original, ruta, tamano) VALUES (?, ?, ?, ?, ?)");
    $insertar->execute([$titulo, $descripcion, $original, $ruta, (int)$archivo['size']]);

    echo json_encode([
        "id" => $pdo->lastInsertId(),
        "titulo" => $titulo,
        "descripcion" => $descripcion,
        "archivo_original" => $original,
        "ruta" => $ruta,
        "tamano" => (int)$archivo['size'],
        "fecha" => date("Y-m-d H:i:s"),
    ]);
    exit;
}

// ----- Eliminar un archivo (?id=X): borra la fila y el archivo del disco -----
if ($metodo === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(["error" => "Falta el id"]); exit; }

    $buscar = $pdo->prepare("SELECT ruta FROM descargas WHERE id = ?");
    $buscar->execute([$id]);
    $fila = $buscar->fetch();

    if ($fila) {
        $archivoEnDisco = __DIR__ . "/../" . $fila['ruta'];
        if (is_file($archivoEnDisco)) {
            unlink($archivoEnDisco);
        }
        $borrar = $pdo->prepare("DELETE FROM descargas WHERE id = ?");
        $borrar->execute([$id]);
    }

    echo json_encode(["ok" => true]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);
