<?php
require_once 'includes/sesion.php';
if (!empty($_SESSION['usuario_id'])) {
    header('Location: perfil.php');
    exit;
}
$titulo = "Sistemas y Telecomunicaciones - Consultar / Iniciar Sesión";
?>
<!DOCTYPE html>
<html lang="es">
<head>
<?php include 'includes/head.php'; ?>
</head>
<body data-page="consultar" data-marca-derecha="true">

<?php include 'includes/header.php'; ?>

  <main id="contenido-login">
    <div class="contenedor-login">
      <div class="tabs-login">
        <button class="activo" data-tab="login">Iniciar Sesión</button>
        <button data-tab="registro">Registrarse</button>
      </div>

      <h3 data-titulo-form>Iniciar Sesión</h3>

      <div class="campo" data-campo-nombre style="display:none;">
        <label>Nombre y Apellido</label>
        <input type="text" placeholder="Juan Pérez" data-nombre maxlength="30">
      </div>
      <div class="campo">
        <label>Correo electrónico</label>
        <input type="email" placeholder="loremipsum@dominio.com" data-correo>
      </div>
      <div class="campo">
        <label>Contraseña</label>
        <input type="password" placeholder="••••••••" data-contrasena>
      </div>

      <p class="mensaje-admin" data-mensaje-login></p>
      <button class="boton" style="width:100%;" data-btn-enviar>Ingresar</button>
      <a href="#" class="enlace-error">¿Algún error? comentarios</a>
    </div>
  </main>

<?php include 'includes/pie.php'; ?>
</body>
</html>
