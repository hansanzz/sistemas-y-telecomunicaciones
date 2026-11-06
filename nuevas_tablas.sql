-- Tablas nuevas para las páginas Descargas y Avisos.
-- Cómo usarlo: abrí phpMyAdmin (WAMP), elegí la base "sistemas_telecom",
-- andá a la pestaña "SQL", pegá todo esto y tocá "Continuar".

CREATE TABLE IF NOT EXISTS descargas (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  titulo           VARCHAR(150) NOT NULL,
  descripcion      VARCHAR(300) NOT NULL DEFAULT '',
  archivo_original VARCHAR(200) NOT NULL,   -- nombre con el que se subió (ej: guia_ipv6.pdf)
  ruta             VARCHAR(255) NOT NULL,   -- dónde quedó guardado (uploads/descargas/xxxx.pdf)
  tamano           INT UNSIGNED NOT NULL DEFAULT 0,  -- en bytes
  fecha            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS avisos (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  titulo   VARCHAR(120) NOT NULL,
  texto    VARCHAR(500) NOT NULL DEFAULT '',
  etiqueta VARCHAR(20)  NOT NULL DEFAULT 'General',  -- Importante, Recurso, Recordatorio o General
  fecha    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Avisos de ejemplo (podés borrarlos desde la página)
INSERT INTO avisos (titulo, texto, etiqueta) VALUES
('Mantenimiento programado', 'La plataforma estará en mantenimiento el sábado de 22:00 a 00:00.', 'Importante'),
('Nuevo recurso disponible', 'Ya podés consultar la guía de IPv6 en la sección Descargas.', 'Recurso'),
('Recordatorio: evaluación de seguridad', 'No olvides completar la autoevaluación de Seguridad Informática.', 'Recordatorio'),
('Actualización de plataforma', 'Se agregaron nuevas herramientas y mejoras de rendimiento.', 'General');
