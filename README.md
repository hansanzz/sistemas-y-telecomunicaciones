
## Paso 1: Base de datos (phpMyAdmin → `sistemas_telecom` → SQL)

```sql
ALTER TABLE usuarios ADD fecha_nacimiento DATE NULL;
```
Si dice "Duplicate column name", ya la tenés (del Ejercicio 1 o 2): seguí.

## Paso 2: `login.php`

Debajo del bloque de "Contraseña", agregá este campo (sin `display:none`, así se ve en login y en registro):

```html
      <div class="campo">
        <label>Fecha de nacimiento</label>
        <input type="date" data-nacimiento>
      </div>
```

## Paso 3: `script.js`, función `pintarLogin`

a) Debajo de `const inputContrasena = ...` agregá:
```js
  const inputNacimiento = cont.querySelector("[data-nacimiento]");
```

b) Reemplazá todo el `btnEnviar.addEventListener("click", async () => { ... });` por:

```js
  btnEnviar.addEventListener("click", async () => {
    if (mensaje) mensaje.textContent = "";
    const correo = inputCorreo.value.trim();
    const contrasena = inputContrasena.value;
    const fecha_nacimiento = inputNacimiento.value;

    if (!correo || !contrasena || !fecha_nacimiento) {
      if (mensaje) mensaje.textContent = "Completá correo, contraseña y fecha de nacimiento.";
      return;
    }

    let url = "api/auth.php?accion=iniciar_sesion";
    let payload = { correo, contrasena, fecha_nacimiento };

    if (modo === "registro") {
      const nombre = inputNombre.value.trim();
      if (!nombre) {
        if (mensaje) mensaje.textContent = "Completá tu nombre y apellido.";
        return;
      }
      url = "api/auth.php?accion=registrar";
      payload = { nombre, correo, contrasena, fecha_nacimiento };
    }

    const { ok, datos: resultado } = await apiAuth(url, payload);
    if (!ok) {
      if (mensaje) mensaje.textContent = resultado.error || "Ocurrió un error, intentá de nuevo.";
      return;
    }
    window.location.href = "perfil.php";
  });
```

## Paso 4: `api/auth.php`

**a)** Arriba, debajo de los `require_once` existentes (necesita `includes/edad.php`, el del README):
```php
require_once __DIR__ . "/../includes/edad.php";
```

**b) En el registro**, después del control de los 6 caracteres y antes de `$existe = ...`:
```php
    $nacimiento = trim((string)($datos['fecha_nacimiento'] ?? ''));
    if (calcularEdad($nacimiento) === null) {
        http_response_code(400);
        echo json_encode(["error" => "La fecha de nacimiento no es válida."]);
        exit;
    }
```
Y cambiá el `INSERT` del registro por:
```php
    $insertar = $pdo->prepare("INSERT INTO usuarios (nombre, correo, contrasena_hash, rol, fecha_nacimiento) VALUES (?, ?, ?, ?, ?)");
    $insertar->execute([$nombre, $correo, $hash, $rol, $nacimiento]);
```

**c) En el inicio de sesión**, **después** del bloque `if (!$usuario || !password_verify(...)) { ... }` y **antes** de `iniciarSesionUsuario($usuario);`:
```php
    $fechaIngresada = trim((string)($datos['fecha_nacimiento'] ?? ''));
    if ($usuario['fecha_nacimiento'] !== null && $usuario['fecha_nacimiento'] !== $fechaIngresada) {
        http_response_code(401);
        echo json_encode(["error" => "La fecha de nacimiento no coincide con la registrada."]);
        exit;
    }
```

## Paso 5: probar

1. Subí `?v=` en `includes/pie.php` y apretá **Ctrl + F5**.
2. **Registrate** con fecha `2008-05-10`: entra.
3. Cerrá sesión y entrá con fecha `2008-05-11`: tiene que decir "La fecha de nacimiento no coincide con la registrada."
4. Entrá con `2008-05-10`: entra.
5. Mirá la columna `fecha_nacimiento` en phpMyAdmin → `usuarios` → Examinar.

## Cosas importantes

- **Tu usuario administrador** (y cualquier cuenta anterior) tiene la fecha vacía (`NULL`). Con el `!== null` del paso 4c, esas cuentas siguen entrando sin pedirla. Si querés que también la usen, cargásela en la pestaña SQL: `UPDATE usuarios SET fecha_nacimiento = '1990-01-15' WHERE correo = 'tucorreo@gmail.com';`
- **Alumnos creados por el administrador:** si hiciste el Ejercicio 1, esos alumnos ya tienen `fecha_nacimiento` guardada y tienen que ingresarla al entrar.
- **No se mezcla con otros ejercicios:** este reemplaza el `click` del botón de login. Si ya habías aplicado el 2, 3 o 4, restaurá el respaldo antes.

## Para el oral

- Se compara una **fecha como texto** `AAAA-MM-DD`, que es el formato que entrega `<input type="date">` y también el que guarda MySQL en una columna `DATE`.
- La validación va en PHP, **después de** `password_verify`: primero se comprueba la contraseña y recién después el dato extra.
- Es un control **débil**: una fecha de nacimiento es fácil de averiguar. Sirve como un dato adicional, pero no reemplaza a la contraseña.

Probalo y contame qué mensaje te sale en cada caso. Si algo no responde, mirá en **F12 → Network → `auth.php` → Response** y mandame lo que dice.
# Guía de ejercicios: página "Sistemas y Telecomunicaciones"

Proyecto: **PHP + MySQL (phpMyAdmin) + JavaScript**, corriendo en **WAMP**.
Esta guía tiene **4 ejercicios resueltos** (el tuyo, el de tu compañera de grupo y los de otros dos compañeros) y **6 ejercicios de práctica** también resueltos, todos con el mismo formato:
consigna → archivos que se tocan → pasos → prueba → explicación para el oral.

> Aviso: el código está escrito sobre tus archivos reales (`login.php`, `script.js`, `api/auth.php`, `api/alumnos.php`), pero no fue ejecutado. Probalo ejercicio por ejercicio y si algo falla mirá la sección **"Si algo falla"**.
Que el campo no aparezca es un tema del **HTML de `login.php`**, no del JavaScript ni de la base. El bloque de código que mandaste llegó vacío, así que no pude ver tu archivo. Las causas más probables son estas, de la más común a la menos común.



Ese error **no viene de tu página**, y mi explicación anterior sobre las comillas probablemente no era la causa. Me equivoqué al darla por hecha sin ver el origen del error.

## Qué significa ese mensaje

`VM400:1 ... at <anonymous>:1:1` aparece cuando se ejecuta algo **escrito directamente en la consola** del navegador. Si el error fuera de tu código, diría `script.js:NNN` (el nombre del archivo y el número de línea). Entonces lo más probable es que hayas escrito la palabra `ingresar` en la consola, y el navegador te contestó que no existe. Eso es normal y no rompe nada.

La consola sirve para **leer** los mensajes que genera la página, no para escribir en ella.

## Cómo ver si hay un error real

1. En la consola, clic en el ícono de **limpiar** (el círculo tachado, arriba a la izquierda del panel).
2. Con la consola abierta, apretá el botón **Ingresar** de la página (no escribas nada en la consola).
3. Mirá si aparece algo nuevo en rojo y fijate si dice `script.js:...`.
   - **No aparece nada rojo:** el JavaScript funciona, y hay que ver qué responde PHP (paso siguiente).
   - **Aparece algo con `script.js:NNN`:** copiame esa línea completa.

## Ver qué responde el servidor

1. En el mismo panel F12, andá a la pestaña **Network** (Red).
2. Apretá **Ingresar**.
3. Aparece una fila **`auth.php?accion=iniciar_sesion`**. Hacé clic en ella.
4. Abrí la pestaña **Response** (Respuesta) y copiame lo que dice.

Según la respuesta:
- `{"error":"..."}` → PHP rechazó el ingreso, y el texto dice el motivo (por ejemplo, fecha que no coincide).
- `{"logueado":true,...}` → el login **sí funcionó** y el problema es otro (la sesión o la redirección).
- Un texto largo con `Fatal error` o `Parse error` → hay un error en `api/auth.php`.
- **No aparece ninguna fila `auth.php`** → el botón no está enviando nada, y revisamos `login.php` y `script.js`.

## Una comprobación rápida más

Mirá si en pantalla, entre el campo de fecha y el botón, aparece algún texto chico celeste después de apretar **Ingresar**. Ese es el mensaje que muestra la propia página.

Mandame lo que ves en **Response** (o decime que no aparece la fila `auth.php`) y con eso te digo qué corregir.
## Índice

0. Cómo abrir esta guía y el proyecto en VS Code
1. Mapa del proyecto (qué hace cada archivo)
2. Cómo ejecutar SQL en phpMyAdmin
3. Antes de cada ejercicio (checklist)
4. Archivo auxiliar `includes/edad.php`
5. Si algo falla
6. **PARTE A: Ejercicios 1 a 4**
7. **PARTE B: Práctica, ejercicios 5 a 10**
8. Resumen final y preguntas típicas de oral

---

## 0. Cómo abrir esta guía y el proyecto en VS Code

1. Abrí **Visual Studio Code**.
2. Menú **File → Open Folder...** y elegí la carpeta del proyecto:
   `C:\wamp64\www\sistemas-telecom-php`
3. Copiá este archivo `README.md` dentro de esa carpeta (así lo ves junto al código).
4. Para verlo con formato (títulos, tablas, colores): abrí el `README.md` y apretá **Ctrl + Shift + V**.
   Si querés verlo al costado del código: **Ctrl + K** y después **V**.
5. Atajos que vas a usar todo el tiempo:

| Atajo | Qué hace |
|---|---|
| `Ctrl + P` | Abrir un archivo escribiendo su nombre (ej: `auth.php`) |
| `Ctrl + F` | Buscar dentro del archivo abierto |
| `Ctrl + Shift + F` | Buscar en **todo** el proyecto |
| `Ctrl + S` | Guardar (¡siempre antes de probar!) |
| `Ctrl + Z` | Deshacer |
| `Alt + Z` | Ajustar líneas largas a la pantalla |

6. Para probar la página, **WAMP tiene que estar en verde** y abrís en el navegador:
   `http://localhost/sistemas-telecom-php/`
   (Nunca hagas doble clic en un `.php`: así no se ejecuta.)

**Cada vez que cambies `script.js`:**
- Abrí `includes/pie.php` y subí el número de versión: `script.js?v=5` → `script.js?v=6` (y así sucesivamente).
- En el navegador apretá **Ctrl + F5** para forzar la recarga.

Si no lo hacés, el navegador sigue usando el `script.js` viejo y parece que "no pasó nada".

---

## 1. Mapa del proyecto

```
sistemas-telecom-php/
├── index.php, perfil.php, login.php, admin.php,
│   notas.php, tutoriales.php, formularios.php,
│   avisos.php, descargas.php, indice.php     ← páginas (HTML + un poco de PHP)
├── config.php        ← conexión a la base (usuario root, base sistemas_telecom)
├── script.js         ← TODO el JavaScript: dibuja las páginas y llama a la API
├── estilos.css       ← diseño
├── data.json         ← textos del menú y datos fijos
├── includes/         ← head.php, header.php, pie.php, sesion.php
├── api/              ← auth.php, alumnos.php, perfil.php, notas.php ...
└── uploads/          ← descargas/ y avatars/
```

| Quiero tocar... | Archivo |
|---|---|
| Campos del formulario de login/registro | `login.php` |
| Qué pasa al tocar el botón "Ingresar" | `script.js` → buscar `function pintarLogin` |
| Reglas de registro / inicio de sesión | `api/auth.php` |
| Agregar/editar/buscar alumnos (panel admin) | `api/alumnos.php` + `script.js` → buscar `Agregar alumno` |
| Datos del perfil | `api/perfil.php`, `perfil.php` y `script.js` → buscar `async function pintarPerfil` |
| Quién es admin / sesión | `includes/sesion.php` |
| Estructura de la base | phpMyAdmin → `sistemas_telecom` |

**El recorrido del login:**

```
login.php (HTML)
   → script.js: pintarLogin (junta los datos y hace fetch)
      → api/auth.php (valida, consulta la base)
         → config.php (conexión PDO)
            → tabla usuarios (phpMyAdmin)
         → $_SESSION (includes/sesion.php)
   → perfil.php (si salió bien)
```

Los alumnos **no tienen tabla propia**: son filas de `usuarios` con `rol = 'alumno'`. Los administradores son filas de `usuarios` con `rol = 'administrador'`.

---

## 2. Cómo ejecutar SQL en phpMyAdmin

Todo lo que diga **"BD"** o `ALTER TABLE` / `CREATE TABLE` se hace en phpMyAdmin (no va en ningún archivo del proyecto):

1. WAMP en verde → **clic izquierdo** sobre el ícono → **phpMyAdmin** (usuario `root`, contraseña vacía).
2. En la columna de la izquierda, hacé clic en **`sistemas_telecom`**.
3. Pestaña **SQL**.
4. Pegá el comando y tocá **Continuar**.
5. Para verificar: tabla `usuarios` → pestaña **Estructura** (columnas) o **Examinar** (datos).

Errores típicos:
- **"Duplicate column name"** → la columna ya existe; salteá ese comando.
- **"Table doesn't exist"** → no elegiste `sistemas_telecom` antes de abrir la pestaña SQL.

---

## 3. Antes de cada ejercicio (checklist)

- [ ] Hacé un **respaldo**: copiá la carpeta del proyecto y exportá la base (phpMyAdmin → `sistemas_telecom` → **Exportar → Rápido → Continuar**).
- [ ] Hacé los ejercicios **de a uno**: varios usan los mismos campos (`data-edad`, etc.) y si los mezclás chocan. Entre uno y otro, restaurá el respaldo o deshacé los cambios.
- [ ] Guardá con `Ctrl + S` cada archivo que toques.
- [ ] Si tocaste `script.js`: subí la versión en `includes/pie.php` y `Ctrl + F5`.

**Receta general (sirve para el examen):**

1. **Base de datos** → agregar la columna.
2. **HTML** (`login.php`) → agregar el campo.
3. **JavaScript** (`script.js`) → leer el campo y enviarlo.
4. **PHP** (`api/...`) → recibir, **validar** y guardar/comparar.
5. **Probar** y mirar el resultado en phpMyAdmin → Examinar.

> La validación importante va SIEMPRE en PHP. La de JavaScript solo avisa rápido, pero se puede saltear.

---

## 4. Archivo auxiliar `includes/edad.php`

Lo usan los ejercicios 1, 2, 5 y 9. Creá el archivo `includes/edad.php` con este contenido:

```php
<?php
// Devuelve la edad en años cumplidos para una fecha 'AAAA-MM-DD'.
// Devuelve null si la fecha no es válida o es futura.
function calcularEdad(string $fecha): ?int {
    $nac = DateTime::createFromFormat('Y-m-d', $fecha);
    if (!$nac || $nac->format('Y-m-d') !== $fecha) return null;
    $hoy = new DateTime('today');
    if ($nac > $hoy) return null;
    return $nac->diff($hoy)->y;
}
```

Ejemplos (hoy es 30/10/2026):
- `2008-05-10` → **18** (cumplió 18 en mayo)
- `2008-12-01` → **17** (cumple 18 en diciembre)
- `2030-01-01` → `null` (fecha futura)
- `2008-02-31` → `null` (fecha que no existe)

---

## 5. Si algo falla

| Síntoma | Qué hacer |
|---|---|
| Nada cambió en la página | Subí `?v=` en `includes/pie.php` y `Ctrl + F5` |
| Pantalla en blanco | Error de PHP. Ícono WAMP → **Logs → PHP error log**; la última línea dice el archivo y la línea del error |
| El botón no hace nada | `F12` en el navegador → pestaña **Console**: muestra el error de JavaScript |
| Mensaje raro al enviar | `F12` → pestaña **Network** → clic en `auth.php` → pestaña **Response**: muestra lo que devolvió PHP |
| "Unknown column 'edad'" | Falta el `ALTER TABLE` en phpMyAdmin |
| "Duplicate column name" | Esa columna ya existe, no repitas el comando |
| "Cannot redeclare calcularEdad" | Hiciste `require_once` del mismo archivo dos veces con `require`; usá siempre `require_once` |
| No te deja entrar al login | Revisá la columna nueva de tu usuario admin en phpMyAdmin (puede estar vacía) |

---
---

# PARTE A: EJERCICIOS 1 A 4

---

## EJERCICIO 1 (el tuyo, ensayo de examen): agregar alumno con fecha de nacimiento y edad

**Consigna:** al agregar un alumno desde el panel de Administradores, pedir **fecha de nacimiento y edad**, validar que coincidan y guardarlos en la base de datos.

**Archivos que se tocan:** phpMyAdmin, `includes/edad.php`, `script.js`, `api/alumnos.php`.

### Paso 1: Base de datos (phpMyAdmin → SQL)

```sql
ALTER TABLE usuarios
  ADD fecha_nacimiento DATE NULL,
  ADD edad TINYINT UNSIGNED NULL;
```

Comprobá en `usuarios` → Estructura que aparecen las dos columnas.

### Paso 2: `script.js`, formulario de "Agregar alumno"

Buscá con `Ctrl + F` el texto `Agregar alumno`. Vas a encontrar el bloque que empieza con `if (tipo === "agregar" && entidad === "alumno") {`. Reemplazá **todo ese bloque** (hasta justo antes de `} else if (tipo === "agregar" && entidad === "curso") {`) por:

```js
    if (tipo === "agregar" && entidad === "alumno") {
      caja.innerHTML = `
        <h3>Agregar alumno</h3>
        <div class="campo"><label>Nombre y Apellido</label><input type="text" data-f-nombre maxlength="30"></div>
        <div class="campo"><label>Correo</label><input type="email" data-f-correo></div>
        <div class="campo"><label>Contraseña provisoria</label><input type="text" data-f-contrasena placeholder="Se la pasás vos al alumno"></div>
        <div class="campo"><label>Fecha de nacimiento</label><input type="date" data-f-nacimiento></div>
        <div class="campo"><label>Edad</label><input type="number" min="1" max="120" data-f-edad></div>
        <button class="boton" data-f-guardar>Agregar alumno</button>
        <p class="mensaje-admin" data-f-mensaje></p>
      `;
      panelAccion.appendChild(caja);
      caja.querySelector("[data-f-guardar]").addEventListener("click", async () => {
        const nombre = caja.querySelector("[data-f-nombre]").value.trim();
        const correo = caja.querySelector("[data-f-correo]").value.trim();
        const contrasena = caja.querySelector("[data-f-contrasena]").value;
        const fecha_nacimiento = caja.querySelector("[data-f-nacimiento]").value;
        const edad = Number(caja.querySelector("[data-f-edad]").value);
        const mensaje = caja.querySelector("[data-f-mensaje]");
        if (!nombre || !correo || !contrasena || !fecha_nacimiento || !edad) {
          mensaje.textContent = "Completá nombre, correo, contraseña, fecha de nacimiento y edad.";
          return;
        }
        const res = await fetch("api/alumnos.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, correo, contrasena, fecha_nacimiento, edad }),
        });
        const cuerpo = await res.json().catch(() => ({}));
        if (!res.ok) {
          mensaje.textContent = cuerpo.error || "No se pudo guardar.";
          return;
        }
        mensaje.textContent = `Alumno "${nombre}" agregado. Ya puede iniciar sesión con ese correo y contraseña.`;
        caja.querySelectorAll("input").forEach((i) => (i.value = ""));
      });

```

(La línea en blanco final y el `} else if (tipo === "agregar" && entidad === "curso") {` que sigue **no se tocan**.)

### Paso 3: `api/alumnos.php`

1. Arriba de todo, debajo de los `require_once` que ya existen, agregá:
```php
require_once __DIR__ . "/../includes/edad.php";
```
2. Reemplazá el bloque `if ($metodo === 'POST') { ... }` completo por:

```php
if ($metodo === 'POST') {
    $datos = json_decode(file_get_contents("php://input"), true);
    $nombre = trim(mb_substr((string)($datos['nombre'] ?? ''), 0, 30));
    $correo = trim((string)($datos['correo'] ?? ''));
    $contrasena = (string)($datos['contrasena'] ?? '');
    $nacimiento = trim((string)($datos['fecha_nacimiento'] ?? ''));
    $edad = (int)($datos['edad'] ?? 0);

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

    // ----- Validación de fecha de nacimiento y edad -----
    $edadReal = calcularEdad($nacimiento);
    if ($edadReal === null) {
        http_response_code(400);
        echo json_encode(["error" => "La fecha de nacimiento no es válida."]);
        exit;
    }
    if ($edadReal !== $edad) {
        http_response_code(400);
        echo json_encode(["error" => "La edad no coincide con la fecha de nacimiento."]);
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
    $insertar = $pdo->prepare("INSERT INTO usuarios (nombre, correo, contrasena_hash, rol, fecha_nacimiento, edad) VALUES (?, ?, ?, 'alumno', ?, ?)");
    $insertar->execute([$nombre, $correo, $hash, $nacimiento, $edad]);

    echo json_encode(["id" => $pdo->lastInsertId(), "nombre" => $nombre, "correo" => $correo]);
    exit;
}
```

3. **Para que se vean al buscar alumnos:** en el mismo archivo, en el bloque `GET`, hay **dos** `SELECT`. En ambos, cambiá `SELECT id, nombre, curso, correo, telefono FROM ...` por `SELECT id, nombre, curso, correo, telefono, fecha_nacimiento, edad FROM ...`.
4. En `script.js`, buscá `<strong>Teléfono:</strong> ${alumno.telefono` y debajo de esa línea agregá:
```js
        <p><strong>Nacimiento:</strong> ${alumno.fecha_nacimiento || ""}</p>
        <p><strong>Edad:</strong> ${alumno.edad ?? ""}</p>
```

### Prueba

1. Subí la versión en `includes/pie.php` y `Ctrl + F5`.
2. Iniciá sesión como administrador → hamburguesa → **Administradores** → **Agregar → Alumno**.
3. Fecha `2008-05-10` y edad `18` → tiene que guardar.
4. Otra vez con fecha `2008-05-10` y edad `20` → tiene que decir "La edad no coincide con la fecha de nacimiento."
5. En phpMyAdmin → `usuarios` → Examinar: se ven `fecha_nacimiento` y `edad` del alumno nuevo.

### Explicación para el oral

- **Vinculado a la base de datos** = la columna existe en `usuarios` y el `INSERT` la completa.
- La comparación se hace en **PHP** (servidor), no solo en JavaScript.
- `calcularEdad` cuenta años **cumplidos**: si todavía no llegó el cumpleaños este año, resta uno.
- **Variante frecuente:** que la edad se calcule sola. Se saca el campo "Edad" del formulario y en PHP queda `$edad = calcularEdad($nacimiento);`.
- **Punto de diseño:** guardar la edad es redundante porque cambia cada año. Lo correcto es guardar solo la fecha y calcular la edad al mostrarla.

---

## EJERCICIO 2 (tu compañera de grupo): edad + cumpleaños en el registro, deben coincidir

**Consigna:** en el **registro** agregar edad y fecha de cumpleaños. Si la edad no coincide con la fecha, no deja registrarse.

**Archivos:** phpMyAdmin, `includes/edad.php`, `login.php`, `script.js`, `api/auth.php`.

### Paso 1: Base de datos
(Si ya hiciste el Ejercicio 1, salteá este paso: las columnas ya existen.)
```sql
ALTER TABLE usuarios
  ADD fecha_nacimiento DATE NULL,
  ADD edad TINYINT UNSIGNED NULL;
```

### Paso 2: `login.php`

Debajo del bloque de "Contraseña" (y antes de `<p class="mensaje-admin"...`) agregá:

```html
      <div class="campo" data-campo-extra style="display:none;">
        <label>Fecha de nacimiento</label>
        <input type="date" data-nacimiento>
      </div>
      <div class="campo" data-campo-extra style="display:none;">
        <label>Edad</label>
        <input type="number" min="1" max="120" placeholder="18" data-edad>
      </div>
```

(`display:none` hace que solo se vean en la pestaña "Registrarse".)

### Paso 3: `script.js`, función `pintarLogin` (`Ctrl + F` → `function pintarLogin`)

a) Debajo de `const btnEnviar = ...` agregá:
```js
  const camposExtra = cont.querySelectorAll("[data-campo-extra]");
  const inputNacimiento = cont.querySelector("[data-nacimiento]");
  const inputEdad = cont.querySelector("[data-edad]");
```

b) Dentro del `tab.addEventListener("click", ...)`, debajo de la línea `campoNombre.style.display = ...`, agregá:
```js
      camposExtra.forEach((c) => (c.style.display = modo === "registro" ? "block" : "none"));
```

c) Reemplazá todo el `btnEnviar.addEventListener("click", async () => { ... });` por:

```js
  btnEnviar.addEventListener("click", async () => {
    if (mensaje) mensaje.textContent = "";
    const correo = inputCorreo.value.trim();
    const contrasena = inputContrasena.value;

    if (!correo || !contrasena) {
      if (mensaje) mensaje.textContent = "Completá correo y contraseña.";
      return;
    }

    let url = "api/auth.php?accion=iniciar_sesion";
    let payload = { correo, contrasena };

    if (modo === "registro") {
      const nombre = inputNombre.value.trim();
      if (!nombre) {
        if (mensaje) mensaje.textContent = "Completá tu nombre y apellido.";
        return;
      }
      const fecha_nacimiento = inputNacimiento.value;
      const edad = Number(inputEdad.value);
      if (!fecha_nacimiento || !edad) {
        if (mensaje) mensaje.textContent = "Completá fecha de nacimiento y edad.";
        return;
      }
      url = "api/auth.php?accion=registrar";
      payload = { nombre, correo, contrasena, fecha_nacimiento, edad };
    }

    const { ok, datos: resultado } = await apiAuth(url, payload);
    if (!ok) {
      if (mensaje) mensaje.textContent = resultado.error || "Ocurrió un error, intentá de nuevo.";
      return;
    }
    window.location.href = "perfil.php";
  });
```

### Paso 4: `api/auth.php`

1. Arriba, debajo de los `require_once` existentes:
```php
require_once __DIR__ . "/../includes/edad.php";
```
2. En la parte `// ----- Registro -----`, **justo después** del `if (mb_strlen($contrasena) < 6) { ... }` y **antes** de `$existe = ...`, agregá:
```php
    $nacimiento = trim((string)($datos['fecha_nacimiento'] ?? ''));
    $edad       = (int)($datos['edad'] ?? 0);
    $edadReal   = calcularEdad($nacimiento);
    if ($edadReal === null || $edadReal !== $edad) {
        http_response_code(400);
        echo json_encode(["error" => "La edad no coincide con la fecha de nacimiento."]);
        exit;
    }
```
3. Cambiá el `INSERT` del registro por:
```php
    $insertar = $pdo->prepare("INSERT INTO usuarios (nombre, correo, contrasena_hash, rol, fecha_nacimiento, edad) VALUES (?, ?, ?, ?, ?, ?)");
    $insertar->execute([$nombre, $correo, $hash, $rol, $nacimiento, $edad]);
```

### Prueba

1. Cerrá sesión → **Consultar** → pestaña **Registrarse**.
2. Fecha `2008-05-10` + edad `18` + datos válidos → se registra y entra.
3. Fecha `2008-05-10` + edad `25` → "La edad no coincide con la fecha de nacimiento."
4. En phpMyAdmin → `usuarios` → Examinar: se ven los datos guardados.

### Explicación para el oral

- Es el mismo control del Ejercicio 1, pero en el **registro público** (`auth.php`) en vez del panel del administrador (`alumnos.php`).
- Al iniciar sesión **no** se pide nada nuevo: solo se valida al crear la cuenta.
- Los usuarios viejos (como tu admin) tienen esas columnas vacías (`NULL`); no pasa nada porque no se les vuelve a validar.

---

## EJERCICIO 3 (otra compañera): pedir la edad al registrarse y de nuevo al iniciar sesión

**Consigna:** el registro pide la edad. Al **iniciar sesión** hay que volver a ingresarla y tiene que **coincidir con la registrada**; si no coincide, no deja entrar.

**Archivos:** phpMyAdmin, `login.php`, `script.js`, `api/auth.php`.

> Si hiciste el Ejercicio 2 antes, deshacé esos cambios (restaurá el respaldo): este usa `data-edad` de otra forma.

### Paso 1: Base de datos
```sql
ALTER TABLE usuarios ADD edad TINYINT UNSIGNED NULL;
```
(Si dice "Duplicate column name", ya existe: seguí.)

### Paso 2: `login.php`

Debajo del bloque de "Contraseña", agregá (sin `display:none`: se ve siempre):

```html
      <div class="campo">
        <label>Edad</label>
        <input type="number" min="1" max="120" placeholder="18" data-edad>
      </div>
```

### Paso 3: `script.js`, función `pintarLogin`

a) Debajo de `const inputContrasena = ...` agregá:
```js
  const inputEdad = cont.querySelector("[data-edad]");
```

b) Reemplazá todo el `btnEnviar.addEventListener("click", async () => { ... });` por:

```js
  btnEnviar.addEventListener("click", async () => {
    if (mensaje) mensaje.textContent = "";
    const correo = inputCorreo.value.trim();
    const contrasena = inputContrasena.value;
    const edad = Number(inputEdad.value);

    if (!correo || !contrasena || !edad) {
      if (mensaje) mensaje.textContent = "Completá correo, contraseña y edad.";
      return;
    }

    let url = "api/auth.php?accion=iniciar_sesion";
    let payload = { correo, contrasena, edad };

    if (modo === "registro") {
      const nombre = inputNombre.value.trim();
      if (!nombre) {
        if (mensaje) mensaje.textContent = "Completá tu nombre y apellido.";
        return;
      }
      url = "api/auth.php?accion=registrar";
      payload = { nombre, correo, contrasena, edad };
    }

    const { ok, datos: resultado } = await apiAuth(url, payload);
    if (!ok) {
      if (mensaje) mensaje.textContent = resultado.error || "Ocurrió un error, intentá de nuevo.";
      return;
    }
    window.location.href = "perfil.php";
  });
```

### Paso 4: `api/auth.php`

**En el registro**, justo después del control de los 6 caracteres y antes de `$existe = ...`:
```php
    $edad = (int)($datos['edad'] ?? 0);
    if ($edad < 1 || $edad > 120) {
        http_response_code(400);
        echo json_encode(["error" => "Ingresá una edad válida (entre 1 y 120)."]);
        exit;
    }
```
Y cambiá el `INSERT` del registro por:
```php
    $insertar = $pdo->prepare("INSERT INTO usuarios (nombre, correo, contrasena_hash, rol, edad) VALUES (?, ?, ?, ?, ?)");
    $insertar->execute([$nombre, $correo, $hash, $rol, $edad]);
```

**En el inicio de sesión**, **después** del bloque `if (!$usuario || !password_verify(...)) { ... }` y **antes** de `iniciarSesionUsuario($usuario);`, agregá:
```php
    $edadIngresada = (int)($datos['edad'] ?? 0);
    if ($usuario['edad'] !== null && (int)$usuario['edad'] !== $edadIngresada) {
        http_response_code(401);
        echo json_encode(["error" => "La edad no coincide con la registrada."]);
        exit;
    }
```

### Prueba

1. Registrate con edad `20`: entra.
2. Cerrá sesión y entrá con edad `25` → "La edad no coincide con la registrada."
3. Entrá con `20` → entra.
4. En phpMyAdmin → `usuarios` → Examinar: columna `edad` = 20.

### Explicación para el oral

- La edad ingresada al entrar se compara con `$usuario['edad']`, que viene de la base.
- El `!== null` existe para los usuarios creados antes (sin edad guardada), que si no, nunca podrían entrar. Si el profe quiere que **todos** tengan edad, se les carga a mano: `UPDATE usuarios SET edad = 30 WHERE correo = 'x@x.com';`
- Se comprueba **después** de `password_verify`: primero se valida la contraseña y recién después el dato extra.
- La edad es un control **débil** (es fácil de adivinar). No reemplaza a la contraseña.

---

## EJERCICIO 4 (compañero de la auditoría): fecha de creación en el login

**Consigna:** guardar la **fecha de creación** de la cuenta. Al iniciar sesión hay que ingresarla; si no coincide, error y no deja entrar.

**Archivos:** phpMyAdmin, `login.php`, `script.js`, `api/auth.php`, `api/perfil.php`, `perfil.php`.

### Paso 1: Base de datos
```sql
ALTER TABLE usuarios ADD fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
```
MySQL completa esta columna **solo** al crear cada usuario, así que no hay que tocar ningún `INSERT`. A las cuentas que ya existen les asigna la fecha en que ejecutás este comando (hoy: 2026-10-30).

### Paso 2: `login.php`

Debajo del bloque de "Contraseña" agregá (visible solo al iniciar sesión, que es el modo inicial):

```html
      <div class="campo" data-campo-fecha>
        <label>Fecha de creación de tu cuenta</label>
        <input type="date" data-fecha-creacion>
      </div>
```

### Paso 3: `script.js`, función `pintarLogin`

a) Debajo de `const btnEnviar = ...` agregá:
```js
  const campoFecha = cont.querySelector("[data-campo-fecha]");
  const inputFecha = cont.querySelector("[data-fecha-creacion]");
```

b) Dentro del `tab.addEventListener("click", ...)`, debajo de `campoNombre.style.display = ...`:
```js
      campoFecha.style.display = modo === "login" ? "block" : "none";
```

c) Reemplazá todo el `btnEnviar.addEventListener("click", async () => { ... });` por:

```js
  btnEnviar.addEventListener("click", async () => {
    if (mensaje) mensaje.textContent = "";
    const correo = inputCorreo.value.trim();
    const contrasena = inputContrasena.value;

    if (!correo || !contrasena) {
      if (mensaje) mensaje.textContent = "Completá correo y contraseña.";
      return;
    }

    let url = "api/auth.php?accion=iniciar_sesion";
    let payload = { correo, contrasena };

    if (modo === "login") {
      const fecha_creacion = inputFecha.value;
      if (!fecha_creacion) {
        if (mensaje) mensaje.textContent = "Ingresá la fecha de creación de tu cuenta.";
        return;
      }
      payload = { correo, contrasena, fecha_creacion };
    }

    if (modo === "registro") {
      const nombre = inputNombre.value.trim();
      if (!nombre) {
        if (mensaje) mensaje.textContent = "Completá tu nombre y apellido.";
        return;
      }
      url = "api/auth.php?accion=registrar";
      payload = { nombre, correo, contrasena };
    }

    const { ok, datos: resultado } = await apiAuth(url, payload);
    if (!ok) {
      if (mensaje) mensaje.textContent = resultado.error || "Ocurrió un error, intentá de nuevo.";
      return;
    }
    window.location.href = "perfil.php";
  });
```

### Paso 4: `api/auth.php`

En `// ----- Iniciar sesión -----`, **después** del bloque `if (!$usuario || !password_verify(...)) { ... }` y **antes** de `iniciarSesionUsuario($usuario);`, agregá:

```php
    $fechaIngresada = trim((string)($datos['fecha_creacion'] ?? ''));
    $fechaReal = substr((string)$usuario['fecha_creacion'], 0, 10);   // 'AAAA-MM-DD'
    if ($fechaIngresada !== $fechaReal) {
        http_response_code(401);
        echo json_encode(["error" => "La fecha de creación no coincide."]);
        exit;
    }
```

### Paso 5: mostrar la fecha en el perfil (si no, el usuario no podría saberla)

- `api/perfil.php`: en la función `obtenerPerfil`, el `SELECT` pasa a ser:
```php
    $consulta = $pdo->prepare("SELECT id, nombre, curso, correo, telefono, rol, avatar, fecha_creacion FROM usuarios WHERE id = ?");
```
- `perfil.php`: después de la línea del Teléfono, agregá:
```html
        <p><strong>Cuenta creada el:</strong> <span data-fecha-creacion></span></p>
```
- `script.js`, en `async function pintarPerfil`: junto a las otras constantes:
```js
  const spanFecha = cont.querySelector("[data-fecha-creacion]");
```
y debajo de `spanTelefono.textContent = ...`:
```js
  spanFecha.textContent = (perfil.fecha_creacion || "").slice(0, 10);
```

### Prueba

1. Registrate con un correo nuevo (queda creada hoy: `2026-10-30`). Mirá tu perfil: aparece la fecha.
2. Cerrá sesión y entrá con la fecha `2026-10-30` → entra.
3. Entrá con `2026-10-29` → "La fecha de creación no coincide."
4. phpMyAdmin → `usuarios` → Examinar: columna `fecha_creacion` con fecha y hora.

### Variante: auditoría completa (por si el profe la pide)

```sql
CREATE TABLE auditoria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  correo VARCHAR(100) NOT NULL,
  accion VARCHAR(30) NOT NULL,       -- 'login' o 'registro'
  resultado VARCHAR(20) NOT NULL,    -- 'ok' o 'fallo'
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

En `api/auth.php`, debajo de la función `datosPublicos`, agregá:
```php
function auditar($pdo, $usuarioId, $correo, $accion, $resultado) {
    $q = $pdo->prepare("INSERT INTO auditoria (usuario_id, correo, accion, resultado) VALUES (?, ?, ?, ?)");
    $q->execute([$usuarioId, $correo, $accion, $resultado]);
}
```
Y llamala en cada punto del login:
- antes de cada `exit` de error: `auditar($pdo, $usuario['id'] ?? null, $correo, 'login', 'fallo');`
- antes de `iniciarSesionUsuario($usuario);`: `auditar($pdo, $usuario['id'], $correo, 'login', 'ok');`

Se consulta en phpMyAdmin → `auditoria` → Examinar.

### Explicación para el oral

- `DEFAULT CURRENT_TIMESTAMP` hace que la propia base escriba la fecha al insertar.
- Una **auditoría** guarda *quién*, *qué* y *cuándo*. La tabla `auditoria` registra eso para cada intento.
- La fecha se compara como texto `AAAA-MM-DD` (`substr(..., 0, 10)`) para ignorar la hora.

---
---

# PARTE B: PRÁCTICA (EJERCICIOS 5 A 10)

Mismo formato. Intentá resolver cada uno **sin mirar** y después compará.

---

## EJERCICIO 5: solo mayores de 18 en el registro

**Consigna:** el registro pide fecha de nacimiento y no deja registrarse a menores de 18 años.

**Archivos:** phpMyAdmin, `includes/edad.php`, `login.php`, `script.js`, `api/auth.php`.

### Paso 1: Base de datos
```sql
ALTER TABLE usuarios ADD fecha_nacimiento DATE NULL;
```

### Paso 2: `login.php`
Debajo de "Contraseña":
```html
      <div class="campo" data-campo-nacimiento style="display:none;">
        <label>Fecha de nacimiento</label>
        <input type="date" data-nacimiento>
      </div>
```

### Paso 3: `script.js` (`pintarLogin`)
- Constantes (debajo de `const btnEnviar`):
```js
  const campoNacimiento = cont.querySelector("[data-campo-nacimiento]");
  const inputNacimiento = cont.querySelector("[data-nacimiento]");
```
- En el `click` de las pestañas, debajo de `campoNombre.style.display = ...`:
```js
      campoNacimiento.style.display = modo === "registro" ? "block" : "none";
```
- Dentro del `if (modo === "registro") { ... }`, antes de `url = ...registrar`, y reemplazando el `payload`:
```js
      const fecha_nacimiento = inputNacimiento.value;
      if (!fecha_nacimiento) {
        if (mensaje) mensaje.textContent = "Ingresá tu fecha de nacimiento.";
        return;
      }
      url = "api/auth.php?accion=registrar";
      payload = { nombre, correo, contrasena, fecha_nacimiento };
```

### Paso 4: `api/auth.php`
- Arriba: `require_once __DIR__ . "/../includes/edad.php";`
- En el registro, después del control de contraseña y antes de `$existe = ...`:
```php
    $nacimiento = trim((string)($datos['fecha_nacimiento'] ?? ''));
    $edadReal = calcularEdad($nacimiento);
    if ($edadReal === null) {
        http_response_code(400);
        echo json_encode(["error" => "La fecha de nacimiento no es válida."]);
        exit;
    }
    if ($edadReal < 18) {
        http_response_code(403);
        echo json_encode(["error" => "Tenés que ser mayor de 18 años para registrarte."]);
        exit;
    }
```
- El `INSERT` del registro pasa a ser:
```php
    $insertar = $pdo->prepare("INSERT INTO usuarios (nombre, correo, contrasena_hash, rol, fecha_nacimiento) VALUES (?, ?, ?, ?, ?)");
    $insertar->execute([$nombre, $correo, $hash, $rol, $nacimiento]);
```

### Prueba
- `2008-12-01` (17 años hoy) → "Tenés que ser mayor de 18 años para registrarte."
- `2008-05-10` (18 años) → se registra.

### Explicación
- `403` significa "prohibido": entendió el pedido pero no lo permite.
- Es una **regla de negocio** validada en el servidor.
- El borde: alguien que cumple 18 **mañana** todavía tiene 17, y `calcularEdad` lo resuelve bien porque cuenta años cumplidos.

---

## EJERCICIO 6: confirmar contraseña en el registro

**Consigna:** el registro pide repetir la contraseña. Si no coinciden, no se registra.

**Archivos:** `login.php`, `script.js`, `api/auth.php` (no requiere cambios en la base).

### Paso 1: `login.php`
Debajo de "Contraseña":
```html
      <div class="campo" data-campo-confirmar style="display:none;">
        <label>Repetir contraseña</label>
        <input type="password" placeholder="••••••••" data-contrasena2>
      </div>
```

### Paso 2: `script.js` (`pintarLogin`)
- Constantes:
```js
  const campoConfirmar = cont.querySelector("[data-campo-confirmar]");
  const inputContrasena2 = cont.querySelector("[data-contrasena2]");
```
- En el `click` de las pestañas:
```js
      campoConfirmar.style.display = modo === "registro" ? "block" : "none";
```
- Dentro del `if (modo === "registro")`, antes de `url = ...`:
```js
      const contrasena2 = inputContrasena2.value;
      if (contrasena !== contrasena2) {
        if (mensaje) mensaje.textContent = "Las contraseñas no coinciden.";
        return;
      }
      url = "api/auth.php?accion=registrar";
      payload = { nombre, correo, contrasena, contrasena2 };
```

### Paso 3: `api/auth.php` (en `registrar`, después de `$contrasena = ...`)
```php
    if ($contrasena !== (string)($datos['contrasena2'] ?? '')) {
        http_response_code(400);
        echo json_encode(["error" => "Las contraseñas no coinciden."]);
        exit;
    }
```

### Prueba
- Contraseña `abc12345` y repetir `abc1234` → error.
- Iguales → se registra.

### Explicación
- **Doble control:** el de JS avisa rápido, el de PHP es el que nadie puede saltear (alguien podría llamar a `auth.php` directo).
- Se compara con `!==` (idéntico, tipo y valor).
- La contraseña repetida **no se guarda**: solo se usa para comprobar.

---

## EJERCICIO 7: contraseña de 8+ caracteres, con un número y una mayúscula

**Consigna:** endurecer las reglas de la contraseña en el registro.

**Archivo:** solo `api/auth.php` (no hay cambios en la base ni en el HTML).

### Paso 1
En el registro, reemplazá el control actual:
```php
    if (mb_strlen($contrasena) < 6) {
        http_response_code(400);
        echo json_encode(["error" => "La contraseña debe tener al menos 6 caracteres."]);
        exit;
    }
```
por:
```php
    if (mb_strlen($contrasena) < 8
        || !preg_match('/\d/', $contrasena)
        || !preg_match('/[A-Z]/', $contrasena)) {
        http_response_code(400);
        echo json_encode(["error" => "La contraseña debe tener 8 caracteres, un número y una mayúscula."]);
        exit;
    }
```

### Prueba
- `hola1234` (sin mayúscula) → error.
- `Hola` (corta) → error.
- `Hola12345` → pasa.

### Explicación
- `\d` busca un dígito; `[A-Z]` busca una letra mayúscula (son **expresiones regulares**); `preg_match` devuelve 1 si encuentra coincidencia.
- La regla se aplica **solo al registrarse**. Al iniciar sesión no se revisa el formato: solo se compara con `password_verify`.
- `api/alumnos.php` (contraseña provisoria cargada por el admin) tiene **su propio** control. Si el profe pide que valga para todos, copiá el mismo `if` ahí.

---

## EJERCICIO 8: mostrar la edad en "Mi Perfil"

**Consigna:** que la página de perfil muestre la edad del usuario.

**Archivos:** `api/perfil.php`, `perfil.php`, `script.js` (y `includes/edad.php` en la variante).
Requiere la columna `edad` (Ejercicio 3) o `fecha_nacimiento` (Ejercicios 1, 2 o 5).

### Paso 1: `api/perfil.php`
En la función `obtenerPerfil`, sumá `edad` al `SELECT`:
```php
    $consulta = $pdo->prepare("SELECT id, nombre, curso, correo, telefono, rol, avatar, edad FROM usuarios WHERE id = ?");
```

### Paso 2: `perfil.php`
Después de la línea del Teléfono:
```html
        <p><strong>Edad:</strong> <span data-edad></span></p>
```

### Paso 3: `script.js` (`async function pintarPerfil`)
- Con las otras constantes:
```js
  const spanEdad = cont.querySelector("[data-edad]");
```
- Debajo de `spanTelefono.textContent = ...`:
```js
  spanEdad.textContent = perfil.edad ?? "";
```

### Variante recomendada: calcular la edad desde la fecha de nacimiento
En `api/perfil.php`:
1. Arriba: `require_once __DIR__ . "/../includes/edad.php";`
2. En `obtenerPerfil`, el `SELECT` incluye `fecha_nacimiento` (en vez de `edad`) y en lugar de `return $consulta->fetch();` va:
```php
    $perfil = $consulta->fetch();
    $perfil['edad'] = !empty($perfil['fecha_nacimiento']) ? calcularEdad($perfil['fecha_nacimiento']) : null;
    return $perfil;
```

### Prueba
Entrá con un usuario que tenga edad cargada: aparece en el perfil. Con uno sin edad, queda vacío (sin romper nada).

### Explicación
- Para mostrar un dato nuevo hay **tres eslabones**: el `SELECT` (PHP), el `<span>` (HTML) y la línea que lo llena (JS). Si falta uno, no aparece.
- `??` devuelve el valor de la derecha cuando el de la izquierda es `null` o `undefined`.
- Calcularla evita que la edad quede desactualizada.

---

## EJERCICIO 9: rol nuevo "profesor" que puede publicar avisos

**Consigna:** agregar un tipo de usuario "profesor" que pueda publicar avisos pero **no** entrar al panel de Administradores.

**Archivos:** phpMyAdmin, `api/auth.php`, `includes/sesion.php`, `api/avisos.php`, `script.js`.

### Paso 1: Base de datos
Hoy `admins_autorizados` solo asigna el rol "administrador". Le agregamos una columna de rol:
```sql
ALTER TABLE admins_autorizados ADD rol VARCHAR(20) NOT NULL DEFAULT 'administrador';
INSERT INTO admins_autorizados (correo, rol) VALUES ('profe@correo.com', 'profesor');
```
(Poné un correo real tuyo si querés probarlo.)

### Paso 2: `api/auth.php` (en `registrar`)
Reemplazá estas líneas:
```php
    $esAdmin = $pdo->prepare("SELECT correo FROM admins_autorizados WHERE correo = ?");
    $esAdmin->execute([$correo]);
    $rol = $esAdmin->fetch() ? 'administrador' : 'alumno';
```
por:
```php
    $esAdmin = $pdo->prepare("SELECT rol FROM admins_autorizados WHERE correo = ?");
    $esAdmin->execute([$correo]);
    $filaRol = $esAdmin->fetch();
    $rol = $filaRol ? $filaRol['rol'] : 'alumno';
```

### Paso 3: `includes/sesion.php`
Debajo de la función `esAdministrador()` agregá:
```php
function esProfesor(): bool {
    return !empty($_SESSION['usuario_id']) && ($_SESSION['rol'] ?? '') === 'profesor';
}
```

### Paso 4: `api/avisos.php`
Cambiá:
```php
if (!esAdministrador()) {
```
por:
```php
if (!esAdministrador() && !esProfesor()) {
```

### Paso 5: `script.js`
Buscá con `Ctrl + F` `async function pintarAvisos`. Dentro hay una línea:
```js
  const esAdmin = usuarioEsAdmin(sesion);
```
Cambiala por:
```js
  const esAdmin = usuarioEsAdmin(sesion) || (sesion && sesion.logueado && sesion.usuario.rol === "profesor");
```
(Así el profesor ve el botón "+ Nuevo aviso". El panel Administradores sigue protegido por `admin.php`, que exige rol `administrador`.)

### Prueba
1. Registrate con `profe@correo.com`.
2. En **Avisos** aparece "+ Nuevo aviso" y podés publicar.
3. Entrá a `http://localhost/sistemas-telecom-php/admin.php`: te redirige a `index.php`.
4. phpMyAdmin → `usuarios`: ese usuario tiene `rol = profesor`.

### Explicación
- Los roles son **valores de la columna `rol`**; no hay una tabla de roles.
- El control de permisos se hace en **dos lugares**: el servidor (PHP, el que de verdad protege) y el navegador (JS, que solo decide qué botones mostrar).
- Esto es **autorización** (qué podés hacer), distinto de **autenticación** (quién sos).

---

## EJERCICIO 10: bloquear la cuenta 5 minutos tras 3 intentos fallidos

**Consigna:** si alguien falla la contraseña 3 veces seguidas, la cuenta se bloquea por 5 minutos.

**Archivos:** phpMyAdmin, `api/auth.php`.

### Paso 1: Base de datos
```sql
ALTER TABLE usuarios
  ADD intentos TINYINT UNSIGNED NOT NULL DEFAULT 0,
  ADD bloqueado_hasta DATETIME NULL;
```

### Paso 2: `api/auth.php`
En `// ----- Iniciar sesión -----`, reemplazá desde `$consulta = $pdo->prepare("SELECT * FROM usuarios WHERE correo = ?");` hasta el cierre `}` del `if (!$usuario || !password_verify(...))` por:

```php
    $consulta = $pdo->prepare("SELECT *, (bloqueado_hasta IS NOT NULL AND bloqueado_hasta > NOW()) AS bloqueado FROM usuarios WHERE correo = ?");
    $consulta->execute([$correo]);
    $usuario = $consulta->fetch();

    if ($usuario && $usuario['bloqueado']) {
        http_response_code(429);
        echo json_encode(["error" => "Cuenta bloqueada temporalmente. Probá de nuevo en unos minutos."]);
        exit;
    }

    if (!$usuario || !password_verify($contrasena, $usuario['contrasena_hash'])) {
        if ($usuario) {
            if ($usuario['intentos'] + 1 >= 3) {
                $pdo->prepare("UPDATE usuarios SET intentos = 0, bloqueado_hasta = DATE_ADD(NOW(), INTERVAL 5 MINUTE) WHERE id = ?")->execute([$usuario['id']]);
            } else {
                $pdo->prepare("UPDATE usuarios SET intentos = intentos + 1 WHERE id = ?")->execute([$usuario['id']]);
            }
        }
        http_response_code(401);
        echo json_encode(["error" => "Correo o contraseña incorrectos."]);
        exit;
    }

    // Login correcto: se limpia el contador
    $pdo->prepare("UPDATE usuarios SET intentos = 0, bloqueado_hasta = NULL WHERE id = ?")->execute([$usuario['id']]);
```

(Lo que sigue, `iniciarSesionUsuario($usuario);`, queda igual. Si ya hiciste los Ejercicios 3 o 4, tus controles extra van **después** de este bloque.)

### Prueba
1. Fallá la contraseña 3 veces con un correo existente.
2. La cuarta vez, aunque pongas la contraseña **correcta**: "Cuenta bloqueada temporalmente."
3. phpMyAdmin → `usuarios` → Examinar: se ven `intentos` y `bloqueado_hasta`.
4. Para desbloquear a mano (pestaña SQL):
```sql
UPDATE usuarios SET intentos = 0, bloqueado_hasta = NULL WHERE correo = 'tucorreo@gmail.com';
```

### Explicación
- La hora se compara **en SQL** con `NOW()`: así PHP y MySQL no se pelean por husos horarios.
- Un **ataque de fuerza bruta** prueba muchas contraseñas seguidas; el bloqueo lo frena.
- Si el correo no existe, no hay fila que actualizar, pero la respuesta es igual de genérica: no revela qué correos están registrados.
- El código `429` significa "demasiados intentos".

---
---

# 8. RESUMEN FINAL

| Si me piden... | Tocar... |
|---|---|
| Un dato nuevo del usuario | `ALTER TABLE` → `login.php` → `pintarLogin` → `auth.php` (`INSERT`) |
| Comparar un dato al entrar | `auth.php` → `iniciar_sesion`, **después** de `password_verify` |
| Validar un dato al registrarse | `auth.php` → `registrar`, **antes** de `$existe = ...` |
| Un dato nuevo al agregar alumno (admin) | `script.js` (bloque "Agregar alumno") y `api/alumnos.php` (POST) |
| Mostrar un dato en el perfil | `SELECT` de `api/perfil.php` + `perfil.php` + `pintarPerfil` |
| Un rol nuevo | `admins_autorizados` + `auth.php` + `sesion.php` + el `if` del endpoint |
| Una regla de contraseña | `auth.php` → `registrar` |

## Preguntas típicas de oral

1. **¿Por qué la contraseña no se ve en la base?** Se guarda cifrada con `password_hash` y se compara con `password_verify`.
2. **¿Qué es una sesión?** Datos del usuario que PHP guarda en el servidor (`$_SESSION`) mientras navega; arranca con `session_start()`.
3. **¿Por qué validar en PHP y no solo en JS?** Porque el JavaScript corre en el navegador del usuario y se puede saltear.
4. **¿Qué es una consulta preparada (`prepare` y `?`)?** Separa el SQL de los datos y evita la inyección SQL.
5. **¿Por qué no hay tabla `alumnos`?** Se usa una sola tabla `usuarios` con la columna `rol`.
6. **¿Qué hace `ALTER TABLE`?** Modifica la estructura de una tabla ya existente (agrega columnas, etc.).
7. **¿Diferencia entre autenticación y autorización?** Autenticación = quién sos (login). Autorización = qué podés hacer (rol).
8. **¿Qué significan GET, POST, PUT y DELETE?** Leer, crear, editar y borrar.
9. **¿Qué es `NULL` en una columna?** La ausencia de dato (distinto de 0 o de texto vacío).
10. **¿Por qué se guarda la fecha y no la edad?** Porque la edad cambia cada año y la fecha no.

---

*Para cualquier ejercicio nuevo: leé la consigna, identificá **qué dato** aparece, **dónde se pide** (login, registro, panel admin, perfil) y **dónde se valida**, y aplicá la receta de la sección 3.*
Es el mismo esquema del Ejercicio 3, pero con la **fecha de nacimiento** en lugar de la edad. Quedan estos cambios, todos sobre tus archivos.
