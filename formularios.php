<?php $titulo = "Sistemas y Telecomunicaciones - Ponete a Prueba"; ?>
<!DOCTYPE html>
<html lang="es">
<head>
<?php include 'includes/head.php'; ?>
</head>
<body data-page="formularios" data-marca-derecha="true">

<?php include 'includes/header.php'; ?>

  <main id="contenido-formularios">
    <h2>Ponete a Prueba</h2>
    <p class="subtitulo-formularios">Marcá cada pregunta como resuelta a medida que la vas contestando. Podés agregar o borrar preguntas, y al final de cada unidad hay un espacio para escribir tus respuestas.</p>

    <div class="tabs-unidades" data-tabs-unidades></div>

    <div class="panel-unidad">
      <div class="lista-preguntas" data-lista-preguntas></div>
      <button class="boton" data-agregar-pregunta>+ Agregar pregunta</button>

      <h3 class="titulo-respuestas">Tus respuestas — Guía <span data-numero-unidad-actual></span></h3>
      <textarea class="caja-respuestas" data-caja-respuestas placeholder="Escribí acá tus respuestas de esta unidad..."></textarea>
      <p class="mensaje-guardado" data-mensaje-guardado></p>
    </div>
  </main>

<?php include 'includes/pie.php'; ?>
</body>
</html>
