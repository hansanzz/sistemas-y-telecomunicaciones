<?php $titulo = "Sistemas y Telecomunicaciones - Índice"; ?>
<!DOCTYPE html>
<html lang="es">
<head>
<?php include 'includes/head.php'; ?>
</head>
<body data-page="indice" data-marca-derecha="true">

<?php include 'includes/header.php'; ?>

  <main id="contenido-indice">
    <h2>Índice del sitio</h2>
    <p class="subtitulo-formularios">Todas las secciones de la plataforma en un solo lugar. Escribí una palabra para filtrar.</p>

    <div class="buscador-pagina">
      <input type="text" placeholder="Buscar en el índice..." data-buscar-indice aria-label="Buscar en el índice">
    </div>

    <div class="grid-2" data-indice></div>
  </main>

<?php include 'includes/pie.php'; ?>
</body>
</html>
