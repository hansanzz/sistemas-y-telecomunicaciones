<?php
// Arranca (o retoma) la sesión de PHP. Se incluye al principio de las
// páginas y de los endpoints de la API que necesitan saber quién está
// logueado (perfil.php, admin.php, api/auth.php, api/perfil.php).
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Atajo para los endpoints que solo puede usar un administrador
// (agregar/eliminar guías, agregar/editar/eliminar tutoriales, etc).
function esAdministrador(): bool {
    return !empty($_SESSION['usuario_id']) && ($_SESSION['rol'] ?? '') === 'administrador';
}
