-- =====================================================================
-- Base de datos completa: sistemas_telecom
-- Incluye las 9 tablas originales + las 2 nuevas (descargas y avisos).
-- Cómo usarlo en phpMyAdmin (WAMP):
--   1) Pestaña "SQL" (arriba, sin elegir ninguna base)
--   2) Pegá TODO este archivo y tocá "Continuar"
--   (o pestaña "Importar" -> elegir este archivo -> "Importar")
-- =====================================================================

CREATE DATABASE IF NOT EXISTS sistemas_telecom
  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE sistemas_telecom;

-- ---------- Usuarios (alumnos y administradores) ----------
CREATE TABLE IF NOT EXISTS usuarios (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(60)  NOT NULL,
  correo          VARCHAR(100) NOT NULL UNIQUE,
  contrasena_hash VARCHAR(255) NOT NULL,
  rol             VARCHAR(20)  NOT NULL DEFAULT 'alumno',   -- 'alumno' o 'administrador'
  curso           VARCHAR(100) NOT NULL DEFAULT '',
  telefono        VARCHAR(30)  NOT NULL DEFAULT '',
  avatar          VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Correos que, al registrarse, quedan como administradores
CREATE TABLE IF NOT EXISTS admins_autorizados (
  correo VARCHAR(100) NOT NULL PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Cursos / formularios (título + enlace) ----------
CREATE TABLE IF NOT EXISTS cursos (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  url    VARCHAR(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Notas personales de cada usuario ----------
CREATE TABLE IF NOT EXISTS notas (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  titulo     VARCHAR(150) NOT NULL DEFAULT '',
  texto      TEXT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Pendientes del panel de administradores ----------
CREATE TABLE IF NOT EXISTS pendientes (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  texto VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Tutoriales ----------
CREATE TABLE IF NOT EXISTS tutoriales (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  texto  TEXT NULL,
  orden  INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- "Ponete a prueba": unidades, preguntas y respuestas ----------
CREATE TABLE IF NOT EXISTS unidades_formulario (
  numero INT NOT NULL PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL,
  orden  INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS preguntas_formulario (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  unidad     INT NOT NULL,
  orden      INT NOT NULL DEFAULT 0,
  texto      VARCHAR(500) NOT NULL DEFAULT '',
  completada TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS respuestas_formulario (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  unidad INT NOT NULL UNIQUE,      -- UNIQUE: el código usa ON DUPLICATE KEY UPDATE
  texto  MEDIUMTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Descargas y Avisos (versión nueva de la página) ----------
CREATE TABLE IF NOT EXISTS descargas (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  titulo           VARCHAR(150) NOT NULL,
  descripcion      VARCHAR(300) NOT NULL DEFAULT '',
  archivo_original VARCHAR(200) NOT NULL,
  ruta             VARCHAR(255) NOT NULL,
  tamano           INT UNSIGNED NOT NULL DEFAULT 0,
  fecha            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS avisos (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  titulo   VARCHAR(120) NOT NULL,
  texto    VARCHAR(500) NOT NULL DEFAULT '',
  etiqueta VARCHAR(20)  NOT NULL DEFAULT 'General',
  fecha    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- DATOS DE EJEMPLO
-- =====================================================================

-- IMPORTANTE: cambiá este correo por el TUYO antes de ejecutar.
-- Si te registrás en la página con este mismo correo, quedás como administrador.
INSERT IGNORE INTO admins_autorizados (correo) VALUES ('sanchezhannahmilena@gmail.com');

INSERT IGNORE INTO unidades_formulario (numero, titulo, orden) VALUES
(1, 'Introducción', 1),
(2, 'Topologías', 2),
(4, 'Modelo OSI', 3),
(5, 'Modelo TCP/IP', 4),
(6, 'Direccionamiento IP', 5),
(7, 'Máscara de subred', 6),
(8, 'Subredes 1', 7);

INSERT INTO tutoriales (titulo, texto, orden) VALUES
('¿Cómo programar un ESP32?', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 1),
('Lorem ipsum dolor sit amet', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.', 2),
('Consectetur adipiscing elit', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.', 3),
('Sed do eiusmod tempor', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.', 4),
('Ut labore et dolore magna', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.', 5);

INSERT INTO avisos (titulo, texto, etiqueta) VALUES
('Mantenimiento programado', 'La plataforma estará en mantenimiento el sábado de 22:00 a 00:00.', 'Importante'),
('Nuevo recurso disponible', 'Ya podés consultar la guía de IPv6 en la sección Descargas.', 'Recurso'),
('Recordatorio: evaluación de seguridad', 'No olvides completar la autoevaluación de Seguridad Informática.', 'Recordatorio'),
('Actualización de plataforma', 'Se agregaron nuevas herramientas y mejoras de rendimiento.', 'General');
