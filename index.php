<?php $titulo = "Sistemas y Telecomunicaciones - Inicio"; ?>
<!DOCTYPE html>
<html lang="es">
<head>
<?php include 'includes/head.php'; ?>
</head>
<body data-page="inicio" data-buscador="false" data-marca-derecha="true" data-hamburguesa="false">

<?php include 'includes/header.php'; ?>

  <main id="contenido-inicio">
    <section class="hero">
      <h1>Sistemas y telecomunicaciones:</h1>
      <h2>Tu Portal de Evolución Digital</h2>
      <p data-texto-hero></p>
      <div class="botones-hero">
        <a href="tutoriales.php" class="boton">Explorar tutoriales</a>
        <a href="formularios.php" class="boton contorno">Ponete a prueba</a>
      </div>
    </section>

    <h3 class="seccion-titulo">¿Qué puedes hacer en nuestra plataforma?</h3>
    <div class="grid-2">
      <div class="tarjeta">
        <h3>Dominar Conceptos con Tutoriales Especializados</h3>
        <p>Accede a una biblioteca curada de guías paso a paso, desde los fundamentos de redes hasta arquitecturas de sistemas complejos. Aprende a tu ritmo con material diseñado por expertos.</p>
      </div>
      <div class="tarjeta">
        <h3>Medir tu Conocimiento</h3>
        <p>Pon a prueba tus habilidades con nuestros formularios de autoevaluación. Obtén retroalimentación inmediata sobre tu progreso en cada unidad.</p>
      </div>
    </div>
  </main>

<?php include 'includes/pie.php'; ?>
</body>
</html>
