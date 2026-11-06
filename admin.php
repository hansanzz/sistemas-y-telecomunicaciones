<?php
require_once 'includes/sesion.php';
if (empty($_SESSION['usuario_id']) || ($_SESSION['rol'] ?? '') !== 'administrador') {
    header('Location: index.php');
    exit;
}
$titulo = "Sistemas y Telecomunicaciones - Administradores";
?>
<!DOCTYPE html>
<html lang="es">
<head>
<?php include 'includes/head.php'; ?>
</head>
<body data-page="admin" data-marca-derecha="true">

<?php include 'includes/header.php'; ?>

  <main id="contenido-admin">
    <h1 class="titulo-admin">Administradores</h1>

    <div class="acciones-admin" data-acciones></div>

    <div class="buscador-alumno" data-seccion-busqueda style="display:none;">
      <input type="text" placeholder="Buscar alumno (ej: Pepito Perez)" data-input-busqueda>
    </div>
    <div class="resultado-alumno" data-resultado-alumno></div>

    <div class="panel-accion-admin" data-panel-accion></div>

    <div class="caja-pendientes">
      <div class="fila-titulo-pendientes">
        <h3>Pendientes:</h3>
        <button class="boton-chico" data-agregar-pendiente>+ Agregar</button>
      </div>
      <ul data-pendientes></ul>
    </div>
  </main>

<?php include 'includes/pie.php'; ?>
</body>
</html>
