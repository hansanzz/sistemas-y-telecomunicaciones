// ===== Utilidades =====
async function cargarDatos() {
  const res = await fetch("data.json", { cache: "no-store" });
  return res.json();
}

function crearElemento(tag, clase, html) {
  const el = document.createElement(tag);
  if (clase) el.className = clase;
  if (html !== undefined) el.innerHTML = html;
  return el;
}

// ===== Utilidades para hablar con la API (base de datos MySQL) =====
async function apiGet(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener datos de " + url);
  return res.json();
}
async function apiPost(url, datos) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!res.ok) throw new Error("Error al guardar en " + url);
  return res.json();
}
async function apiPut(url, datos) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!res.ok) throw new Error("Error al actualizar " + url);
  return res.json();
}
async function apiDelete(url) {
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar " + url);
  return res.json();
}
// Variante para login/registro: no lanza excepción si la respuesta no es
// ok, para poder mostrar el mensaje de error puntual que manda el server.
async function apiAuth(url, datos) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  const cuerpo = await res.json().catch(() => ({}));
  return { ok: res.ok, datos: cuerpo };
}

// ===== Header + panel herramientas + menu kebab (comunes a todas las páginas) =====
function construirHeader(datos, opciones, sesion) {
  const header = document.getElementById("app-header");
  if (!header) return;

  const paginaActual = document.body.dataset.page;
  const mostrarBuscador = opciones.buscador !== false;
  const mostrarHamburguesa = opciones.hamburguesa !== false;

  const izquierda = crearElemento("div", "header-izquierda");

  if (mostrarHamburguesa) {
    const btnHam = crearElemento("button", "btn-hamburguesa", "&#9776;");
    btnHam.setAttribute("aria-label", "Abrir herramientas");
    btnHam.addEventListener("click", () => togglePanelHerramientas(true));
    izquierda.appendChild(btnHam);
  }

  if (mostrarBuscador) {
    const buscador = crearElemento(
      "div",
      "buscador",
      `<span>&#128269;</span><input type="text" placeholder="Buscar información de...">`
    );
    izquierda.appendChild(buscador);
  } else {
    izquierda.appendChild(crearElemento("span", "marca", "Sistemas y Telecomunicaciones"));
  }

  const nav = crearElemento("nav", "nav-principal");
  datos.nav.forEach((item) => {
    const a = crearElemento("a", item.page === paginaActual ? "activo" : "", item.label);
    a.href = item.href;
    nav.appendChild(a);
  });

  const derecha = crearElemento("div", "header-derecha");
  const btnKebab = crearElemento("button", "btn-kebab", "&#8942;");
  const menuKebab = crearElemento("div", "menu-kebab");

  const estaLogueado = sesion && sesion.logueado;
  if (estaLogueado) {
    menuKebab.appendChild(crearElemento("span", "", `Hola, ${sesion.usuario.nombre}`));

    const aPerfil = crearElemento("a", "", "Mi Perfil");
    aPerfil.href = "perfil.php";
    menuKebab.appendChild(aPerfil);

    const aSalir = crearElemento("a", "", "Cerrar sesión");
    aSalir.href = "#";
    aSalir.addEventListener("click", async (e) => {
      e.preventDefault();
      await apiPost("api/auth.php?accion=cerrar_sesion", {});
      window.location.href = "index.php";
    });
    menuKebab.appendChild(aSalir);
  } else {
    datos.kebabMenu.forEach((item) => {
      const a = crearElemento("a", "", item.label);
      a.href = item.href;
      menuKebab.appendChild(a);
    });
  }

  btnKebab.addEventListener("click", (e) => {
    e.stopPropagation();
    menuKebab.classList.toggle("abierto");
  });
  document.addEventListener("click", () => menuKebab.classList.remove("abierto"));
  derecha.appendChild(btnKebab);
  derecha.appendChild(menuKebab);

  header.appendChild(izquierda);

  if (opciones.marcaDerecha) {
    header.appendChild(crearElemento("span", "marca", "Sistemas y Telecomunicaciones"));
  }

  header.appendChild(nav);
  header.appendChild(derecha);
}

function construirPanelHerramientas(datos, sesion) {
  const panel = document.getElementById("panel-herramientas");
  const fondo = document.getElementById("fondo-oscurecido");
  if (!panel || !fondo) return;

  const esAdmin = sesion && sesion.logueado && sesion.usuario.rol === "administrador";

  panel.appendChild(crearElemento("h2", "", "HERRAMIENTAS"));
  const lista = crearElemento("ul");
  datos.herramientas
    .filter((item) => item.href !== "admin.php" || esAdmin)
    .forEach((item) => {
      const li = crearElemento("li");
      const a = crearElemento("a", "", `<span>${item.icon}</span><span>${item.label}</span>`);
      a.href = item.href;
      li.appendChild(a);
      lista.appendChild(li);
    });
  panel.appendChild(lista);

  fondo.addEventListener("click", () => togglePanelHerramientas(false));
}

function togglePanelHerramientas(abrir) {
  const panel = document.getElementById("panel-herramientas");
  const fondo = document.getElementById("fondo-oscurecido");
  if (!panel || !fondo) return;
  panel.classList.toggle("abierto", abrir);
  fondo.classList.toggle("visible", abrir);
}

// ===== Página: Inicio =====
function pintarInicio(datos) {
  const cont = document.getElementById("contenido-inicio");
  if (!cont) return;
  cont.querySelector("[data-texto-hero]").textContent = datos.lorem.largo;
}

// ===== Página: Perfil =====
async function pintarPerfil(datos) {
  const cont = document.getElementById("contenido-perfil");
  if (!cont) return;

  const spanNombre = cont.querySelector('[data-campo="nombre"]');
  const spanCurso = cont.querySelector('[data-campo="curso"]');
  const spanCorreo = cont.querySelector("[data-correo]");
  const spanContrasena = cont.querySelector("[data-contrasena]");
  const spanTelefono = cont.querySelector('[data-campo="telefono"]');
  const mensaje = cont.querySelector("[data-mensaje-perfil]");

  // ----- Traer el perfil desde la base de datos (usuario logueado) -----
  let perfil = { nombre: "", curso: "", correo: "", telefono: "" };
  try {
    perfil = await apiGet("api/perfil.php");
  } catch (err) {
    if (mensaje) mensaje.textContent = "No se pudo conectar con la base de datos.";
  }

  spanNombre.textContent = perfil.nombre || "";
  spanCurso.textContent = perfil.curso || "";
  spanCorreo.textContent = perfil.correo || "";
  spanTelefono.textContent = perfil.telefono || "";
  // El correo viene fijo desde el registro, así que si hay sesión activa
  // siempre hay correo: mostramos la contraseña como puntitos.
  spanContrasena.textContent = perfil.correo ? "••••••••" : "";

  // ----- Foto de perfil -----
  const avatarImg = cont.querySelector("[data-avatar-img]");
  const editarFoto = cont.querySelector("[data-editar-foto]");
  const inputFoto = cont.querySelector("[data-input-foto]");

  const mostrarAvatar = (ruta) => {
    if (ruta) {
      avatarImg.src = `${ruta}?t=${Date.now()}`; // evita que quede una versión vieja en caché
      avatarImg.style.display = "block";
    } else {
      avatarImg.style.display = "none";
    }
  };
  mostrarAvatar(perfil.avatar);

  if (editarFoto && inputFoto) {
    editarFoto.addEventListener("click", () => inputFoto.click());

    inputFoto.addEventListener("change", async () => {
      const archivo = inputFoto.files[0];
      if (!archivo) return;

      if (archivo.size > 4 * 1024 * 1024) {
        if (mensaje) mensaje.textContent = "La imagen no puede pesar más de 4 MB.";
        inputFoto.value = "";
        return;
      }

      const formulario = new FormData();
      formulario.append("foto", archivo);

      if (mensaje) mensaje.textContent = "Subiendo foto...";
      try {
        const res = await fetch("api/avatar.php", { method: "POST", body: formulario });
        const cuerpo = await res.json();
        if (!res.ok) {
          if (mensaje) mensaje.textContent = cuerpo.error || "No se pudo subir la foto.";
          return;
        }
        mostrarAvatar(cuerpo.avatar);
        if (mensaje) mensaje.textContent = "Foto actualizada.";
      } catch (err) {
        if (mensaje) mensaje.textContent = "No se pudo conectar con el servidor.";
      }
      inputFoto.value = "";
    });
  }

  // ----- Guardado con "debounce" para no disparar un PUT por cada tecla -----
  let temporizadorGuardado = null;
  const guardarPerfil = () => {
    clearTimeout(temporizadorGuardado);
    temporizadorGuardado = setTimeout(async () => {
      try {
        perfil = await apiPut("api/perfil.php", perfil);
        if (mensaje) {
          mensaje.textContent = "Guardado.";
          setTimeout(() => {
            if (mensaje.textContent === "Guardado.") mensaje.textContent = "";
          }, 1500);
        }
      } catch (err) {
        if (mensaje) mensaje.textContent = "No se pudo guardar. Revisá la conexión con la base de datos.";
      }
    }, 400);
  };

  // ----- Validación en vivo: largo máximo y, si corresponde, solo números -----
  const moverCursorAlFinal = (span) => {
    const rango = document.createRange();
    rango.selectNodeContents(span);
    rango.collapse(false);
    const seleccion = window.getSelection();
    seleccion.removeAllRanges();
    seleccion.addRange(rango);
  };

  const configurarCampo = (span, campo, { maxLength, soloNumeros } = {}) => {
    if (!span) return;
    span.addEventListener("input", () => {
      let texto = span.textContent;
      if (soloNumeros) texto = texto.replace(/[^0-9]/g, "");
      if (maxLength && texto.length > maxLength) texto = texto.slice(0, maxLength);
      if (texto !== span.textContent) {
        span.textContent = texto;
        moverCursorAlFinal(span);
      }
      perfil[campo] = texto;
    });
    span.addEventListener("blur", () => guardarPerfil());
  };

  configurarCampo(spanCurso, "curso", { maxLength: 10 });
  configurarCampo(spanTelefono, "telefono", { maxLength: 20, soloNumeros: true });
}

// ===== Página: Tutoriales (ahora en la base de datos; admin puede agregar/editar/eliminar) =====
async function pintarTutoriales(datos, sesion) {
  const cont = document.getElementById("contenido-tutoriales");
  if (!cont) return;
  const esAdmin = sesion && sesion.logueado && sesion.usuario.rol === "administrador";

  const listaEl = cont.querySelector("[data-lista-tutoriales]");
  const tituloEl = cont.querySelector("[data-titulo-tutorial]");
  const textoEl = cont.querySelector("[data-texto-tutorial]");

  let tutoriales = [];
  try {
    tutoriales = await apiGet("api/tutoriales.php");
  } catch (e) {
    listaEl.innerHTML = "<p>No se pudo conectar con la base de datos.</p>";
    return;
  }

  let actual = tutoriales[0] || null;

  function seleccionar(t) {
    actual = t;
    listaEl.querySelectorAll("a").forEach((a) => a.classList.toggle("activo", Number(a.dataset.id) === t.id));
    tituloEl.textContent = t.titulo;
    tituloEl.contentEditable = esAdmin ? "true" : "false";
    textoEl.textContent = t.texto;
    textoEl.contentEditable = esAdmin ? "true" : "false";
  }

  function guardarActual() {
    if (!actual) return;
    actual.titulo = tituloEl.textContent.trim();
    actual.texto = textoEl.textContent.trim();
    apiPut(`api/tutoriales.php?id=${actual.id}`, { titulo: actual.titulo, texto: actual.texto }).then(() => {
      const a = listaEl.querySelector(`a[data-id="${actual.id}"]`);
      if (a) a.textContent = actual.titulo;
    });
  }

  function renderLista() {
    listaEl.innerHTML = "";
    tutoriales.forEach((t) => {
      const fila = crearElemento("div", "fila-tutorial-item");
      fila.style.display = "flex";
      fila.style.alignItems = "center";
      fila.style.gap = "6px";

      const a = crearElemento("a", actual && t.id === actual.id ? "activo" : "", t.titulo);
      a.href = "#";
      a.dataset.id = t.id;
      a.style.flex = "1";
      a.addEventListener("click", (e) => {
        e.preventDefault();
        seleccionar(t);
      });
      fila.appendChild(a);

      if (esAdmin) {
        const btnBorrar = crearElemento("button", "btn-borrar-pendiente", "&times;");
        btnBorrar.title = "Eliminar tutorial";
        btnBorrar.addEventListener("click", async (e) => {
          e.preventDefault();
          await apiDelete(`api/tutoriales.php?id=${t.id}`);
          tutoriales = tutoriales.filter((x) => x.id !== t.id);
          if (actual && actual.id === t.id) actual = tutoriales[0] || null;
          renderLista();
          if (actual) seleccionar(actual);
          else {
            tituloEl.textContent = "";
            textoEl.textContent = "";
          }
        });
        fila.appendChild(btnBorrar);
      }

      listaEl.appendChild(fila);
    });
  }

  renderLista();
  if (actual) seleccionar(actual);

  if (esAdmin) {
    tituloEl.addEventListener("blur", guardarActual);
    textoEl.addEventListener("blur", guardarActual);

    const btnAgregar = crearElemento("button", "boton-chico", "+ Agregar tutorial");
    btnAgregar.style.marginBottom = "16px";
    btnAgregar.addEventListener("click", async () => {
      const nuevo = await apiPost("api/tutoriales.php", {});
      tutoriales.push(nuevo);
      renderLista();
      seleccionar(nuevo);
      tituloEl.focus();
    });
    listaEl.insertAdjacentElement("afterend", btnAgregar);
  }
}

// ===== Página: Formularios / Ponete a prueba (preguntas + respuestas vía API) =====
async function pintarFormularios(datos, sesion) {
  const cont = document.getElementById("contenido-formularios");
  if (!cont) return;
  const esAdmin = sesion && sesion.logueado && sesion.usuario.rol === "administrador";

  let unidades = [];
  try {
    unidades = await apiGet("api/unidades.php");
  } catch (e) {
    cont.querySelector("[data-tabs-unidades]").innerHTML = "<p>No se pudo conectar con la base de datos.</p>";
    return;
  }

  const tabsEl = cont.querySelector("[data-tabs-unidades]");
  const listaPreguntasEl = cont.querySelector("[data-lista-preguntas]");
  const numeroUnidadEl = cont.querySelector("[data-numero-unidad-actual]");
  const cajaRespuestas = cont.querySelector("[data-caja-respuestas]");
  const mensajeGuardado = cont.querySelector("[data-mensaje-guardado]");
  const btnAgregarPregunta = cont.querySelector("[data-agregar-pregunta]");

  let unidadActual = unidades[0] ? unidades[0].numero : null;

  // ----- Pestañas (una por guía) -----
  function renderTabs() {
    tabsEl.innerHTML = "";

    if (unidades.length === 0 && !esAdmin) {
      tabsEl.innerHTML = "<p>Todavía no hay ninguna guía cargada.</p>";
      return;
    }

    unidades.forEach((u) => {
      const wrapper = crearElemento("span");
      wrapper.style.display = "inline-flex";
      wrapper.style.alignItems = "center";

      const btn = crearElemento("button", u.numero === unidadActual ? "activo" : "", `Guía ${u.numero}`);
      btn.title = u.titulo;
      btn.addEventListener("click", () => {
        unidadActual = u.numero;
        renderTabs();
        cargarUnidad(unidadActual);
      });
      wrapper.appendChild(btn);

      if (esAdmin) {
        const btnBorrar = crearElemento("button", "btn-borrar-pendiente", "&times;");
        btnBorrar.title = "Eliminar esta guía";
        btnBorrar.addEventListener("click", async () => {
          if (!confirm(`¿Eliminar la guía "${u.titulo}" y todas sus preguntas/respuestas?`)) return;
          await apiDelete(`api/unidades.php?numero=${u.numero}`);
          unidades = unidades.filter((x) => x.numero !== u.numero);
          if (unidadActual === u.numero) {
            unidadActual = unidades[0] ? unidades[0].numero : null;
          }
          renderTabs();
          if (unidadActual) cargarUnidad(unidadActual);
          else {
            listaPreguntasEl.innerHTML = "";
            numeroUnidadEl.textContent = "";
          }
        });
        wrapper.appendChild(btnBorrar);
      }

      tabsEl.appendChild(wrapper);
    });

    if (esAdmin) {
      const btnAgregarGuia = crearElemento("button", "boton-chico", "+ Agregar guía");
      btnAgregarGuia.addEventListener("click", async () => {
        const titulo = prompt("Título de la nueva guía:");
        if (!titulo || !titulo.trim()) return;
        const nueva = await apiPost("api/unidades.php", { titulo: titulo.trim() });
        unidades.push(nueva);
        unidadActual = nueva.numero;
        renderTabs();
        cargarUnidad(unidadActual);
      });
      tabsEl.appendChild(btnAgregarGuia);
    }
  }

  // ----- Cargar preguntas + respuesta de una unidad -----
  async function cargarUnidad(numero) {
    numeroUnidadEl.textContent = numero;
    listaPreguntasEl.innerHTML = "<p>Cargando...</p>";
    cajaRespuestas.value = "";
    mensajeGuardado.textContent = "";

    let preguntas = [];
    try {
      preguntas = await apiGet(`api/preguntas.php?unidad=${numero}`);
    } catch (e) {
      listaPreguntasEl.innerHTML = "<p>No se pudo conectar con la base de datos.</p>";
      return;
    }
    renderPreguntas(numero, preguntas);

    try {
      const respuesta = await apiGet(`api/respuestas.php?unidad=${numero}`);
      cajaRespuestas.value = respuesta.texto || "";
    } catch (e) {
      // si falla, dejamos la caja vacía sin romper el resto de la página
    }
  }

  function renderPreguntas(numero, preguntas) {
    listaPreguntasEl.innerHTML = "";
    preguntas.forEach((p) => {
      const item = crearElemento("div", "item-pregunta" + (Number(p.completada) ? " completada" : ""));
      item.innerHTML = `
        <input type="checkbox" ${Number(p.completada) ? "checked" : ""}>
        <span class="texto-pregunta" contenteditable="true">${p.texto}</span>
        <button class="btn-borrar-pregunta" title="Eliminar">&times;</button>
      `;

      const checkbox = item.querySelector('input[type="checkbox"]');
      checkbox.addEventListener("change", async () => {
        item.classList.toggle("completada", checkbox.checked);
        await apiPut(`api/preguntas.php?id=${p.id}`, { completada: checkbox.checked });
      });

      const texto = item.querySelector(".texto-pregunta");
      texto.addEventListener("blur", async () => {
        const nuevoTexto = texto.textContent.trim();
        await apiPut(`api/preguntas.php?id=${p.id}`, { texto: nuevoTexto, completada: checkbox.checked });
      });

      item.querySelector(".btn-borrar-pregunta").addEventListener("click", async () => {
        await apiDelete(`api/preguntas.php?id=${p.id}`);
        item.remove();
      });

      listaPreguntasEl.appendChild(item);
    });
  }

  btnAgregarPregunta.addEventListener("click", async () => {
    const resultado = await apiPost("api/preguntas.php", { unidad: unidadActual, texto: "Nueva pregunta..." });
    const item = crearElemento("div", "item-pregunta");
    item.innerHTML = `
      <input type="checkbox">
      <span class="texto-pregunta" contenteditable="true">Nueva pregunta...</span>
      <button class="btn-borrar-pregunta" title="Eliminar">&times;</button>
    `;
    const checkbox = item.querySelector('input[type="checkbox"]');
    checkbox.addEventListener("change", async () => {
      item.classList.toggle("completada", checkbox.checked);
      await apiPut(`api/preguntas.php?id=${resultado.id}`, { completada: checkbox.checked });
    });
    const texto = item.querySelector(".texto-pregunta");
    texto.addEventListener("blur", async () => {
      await apiPut(`api/preguntas.php?id=${resultado.id}`, { texto: texto.textContent.trim(), completada: checkbox.checked });
    });
    item.querySelector(".btn-borrar-pregunta").addEventListener("click", async () => {
      await apiDelete(`api/preguntas.php?id=${resultado.id}`);
      item.remove();
    });
    listaPreguntasEl.appendChild(item);
    texto.focus();
  });

  // ----- Guardar respuestas (texto libre) al salir de la caja -----
  let temporizadorGuardado = null;
  cajaRespuestas.addEventListener("input", () => {
    mensajeGuardado.textContent = "Escribiendo...";
    clearTimeout(temporizadorGuardado);
    temporizadorGuardado = setTimeout(guardarRespuesta, 800);
  });
  cajaRespuestas.addEventListener("blur", guardarRespuesta);

  async function guardarRespuesta() {
    try {
      await apiPut(`api/respuestas.php?unidad=${unidadActual}`, { texto: cajaRespuestas.value });
      mensajeGuardado.textContent = "Guardado.";
    } catch (e) {
      mensajeGuardado.textContent = "No se pudo guardar (revisá la base de datos).";
    }
  }

  renderTabs();
  if (unidadActual) cargarUnidad(unidadActual);
}

// ===== Página: Notas (ahora usa la base de datos MySQL vía api/notas.php) =====
async function pintarNotas(datos) {
  const cont = document.getElementById("contenido-notas");
  if (!cont) return;
  const grid = cont.querySelector("[data-grid-notas]");

  let notas = [];
  try {
    notas = await apiGet("api/notas.php");
  } catch (e) {
    grid.innerHTML = `<p>No se pudo conectar con la base de datos. Revisá que WAMP esté prendido y que la base "sistemas_telecom" exista.</p>`;
    return;
  }

  function renderNotas() {
    grid.innerHTML = "";
    notas.forEach((n) => {
      const tarjeta = crearElemento("div", "tarjeta-nota");
      tarjeta.innerHTML = `
        <button class="btn-borrar-nota" title="Eliminar nota">&times;</button>
        <h3 contenteditable="true" data-campo="titulo">${n.titulo}</h3>
        <p contenteditable="true" data-campo="texto">${n.texto ?? ""}</p>
      `;

      tarjeta.querySelector(".btn-borrar-nota").addEventListener("click", async () => {
        await apiDelete(`api/notas.php?id=${n.id}`);
        notas = notas.filter((x) => x.id !== n.id);
        renderNotas();
      });

      const titulo = tarjeta.querySelector('[data-campo="titulo"]');
      const texto = tarjeta.querySelector('[data-campo="texto"]');
      const guardarCambios = async () => {
        n.titulo = titulo.textContent.trim();
        n.texto = texto.textContent.trim();
        await apiPut(`api/notas.php?id=${n.id}`, { titulo: n.titulo, texto: n.texto });
      };
      titulo.addEventListener("blur", guardarCambios);
      texto.addEventListener("blur", guardarCambios);

      grid.appendChild(tarjeta);
    });
  }

  cont.querySelector("[data-agregar-nota]").addEventListener("click", async () => {
    const nueva = { titulo: "Nueva nota", texto: "Escribí acá lo que quieras recordar..." };
    const resultado = await apiPost("api/notas.php", nueva);
    notas.push({ id: resultado.id, ...nueva });
    renderNotas();
  });

  renderNotas();
}

// ===== Página: Admin (Agregar / Editar / Eliminar contra la base de datos MySQL) =====
async function pintarAdmin(datos) {
  const cont = document.getElementById("contenido-admin");
  if (!cont) return;

  const acciones = cont.querySelector("[data-acciones]");
  const panelAccion = cont.querySelector("[data-panel-accion]");

  datos.adminAcciones.forEach((accion) => {
    const bloque = crearElemento("div", "bloque-accion");
    const btn = crearElemento("button", "", accion.label);
    bloque.appendChild(btn);

    if (accion.tipo === "buscar") {
      btn.addEventListener("click", () => {
        const seccion = cont.querySelector("[data-seccion-busqueda]");
        seccion.style.display = seccion.style.display === "block" ? "none" : "block";
        panelAccion.innerHTML = "";
      });
    } else {
      accion.opciones.forEach((op) => {
        const spanOp = crearElemento("span", "opcion", op.label);
        spanOp.addEventListener("click", () => {
          mostrarFormularioAdmin(accion.tipo, op.entidad, op.label);
        });
        bloque.appendChild(spanOp);
      });
      btn.addEventListener("click", () => bloque.classList.toggle("abierto"));
    }
    acciones.appendChild(bloque);
  });

  // ----- Pendientes (tabla "pendientes" en la base de datos) -----
  let pendientes = [];
  const listaPendientes = cont.querySelector("[data-pendientes]");
  try {
    pendientes = await apiGet("api/pendientes.php");
  } catch (e) {
    listaPendientes.innerHTML = `<li>No se pudo conectar con la base de datos.</li>`;
  }

  function renderPendientes() {
    listaPendientes.innerHTML = "";
    pendientes.forEach((p) => {
      const li = crearElemento("li", "item-pendiente");
      li.innerHTML = `
        <span contenteditable="true" data-p-texto>${p.texto}</span>
        <button class="btn-borrar-pendiente" title="Eliminar">&times;</button>
      `;
      li.querySelector("[data-p-texto]").addEventListener("blur", async (e) => {
        p.texto = e.target.textContent.trim();
        await apiPut(`api/pendientes.php?id=${p.id}`, { texto: p.texto });
      });
      li.querySelector(".btn-borrar-pendiente").addEventListener("click", async () => {
        await apiDelete(`api/pendientes.php?id=${p.id}`);
        pendientes = pendientes.filter((x) => x.id !== p.id);
        renderPendientes();
      });
      listaPendientes.appendChild(li);
    });
  }
  renderPendientes();

  const btnAgregarPendiente = cont.querySelector("[data-agregar-pendiente]");
  if (btnAgregarPendiente) {
    btnAgregarPendiente.addEventListener("click", async () => {
      const resultado = await apiPost("api/pendientes.php", { texto: "Nuevo pendiente..." });
      pendientes.push({ id: resultado.id, texto: "Nuevo pendiente..." });
      renderPendientes();
    });
  }

  // ----- Buscar alumno (consulta en vivo a la tabla "alumnos") -----
  const input = cont.querySelector("[data-input-busqueda]");
  const resultado = cont.querySelector("[data-resultado-alumno]");
  let temporizadorBusqueda = null;

  async function buscarAlumno() {
    const termino = input.value.trim();
    if (!termino) {
      resultado.innerHTML = "";
      return;
    }

    resultado.innerHTML = "<p>Buscando...</p>";
    let encontrados = [];
    try {
      encontrados = await apiGet(`api/alumnos.php?buscar=${encodeURIComponent(termino)}`);
    } catch (err) {
      resultado.innerHTML = `<p>No se pudo conectar con la base de datos.</p>`;
      return;
    }

    if (encontrados.length === 0) {
      resultado.innerHTML = `<p>No se encontró ningún alumno con "${termino}". Si es un alumno nuevo, cargalo primero con "Agregar > Alumno".</p>`;
      return;
    }

    resultado.innerHTML = "";
    encontrados.forEach((alumno) => {
      const tarjeta = crearElemento(
        "div",
        "tarjeta",
        `
        <p><strong>Nombre:</strong> ${alumno.nombre}</p>
        <p><strong>Curso:</strong> ${alumno.curso || ""}</p>
        <p><strong>Correo:</strong> ${alumno.correo || ""}</p>
        <p><strong>Teléfono:</strong> ${alumno.telefono || ""}</p>
      `
      );
      resultado.appendChild(tarjeta);
    });
  }

  input.addEventListener("input", () => {
    clearTimeout(temporizadorBusqueda);
    temporizadorBusqueda = setTimeout(buscarAlumno, 350);
  });

  // ----- Formularios de Agregar / Editar / Eliminar -----
  function mostrarFormularioAdmin(tipo, entidad, etiqueta) {
    panelAccion.innerHTML = "";
    const caja = crearElemento("div", "tarjeta panel-form");

    if (tipo === "agregar" && entidad === "alumno") {
      caja.innerHTML = `
        <h3>Agregar alumno</h3>
        <div class="campo"><label>Nombre y Apellido</label><input type="text" data-f-nombre maxlength="30"></div>
        <div class="campo"><label>Correo</label><input type="email" data-f-correo></div>
        <div class="campo"><label>Contraseña provisoria</label><input type="text" data-f-contrasena placeholder="Se la pasás vos al alumno"></div>
        <button class="boton" data-f-guardar>Agregar alumno</button>
        <p class="mensaje-admin" data-f-mensaje></p>
      `;
      panelAccion.appendChild(caja);
      caja.querySelector("[data-f-guardar]").addEventListener("click", async () => {
        const nombre = caja.querySelector("[data-f-nombre]").value.trim();
        const correo = caja.querySelector("[data-f-correo]").value.trim();
        const contrasena = caja.querySelector("[data-f-contrasena]").value;
        const mensaje = caja.querySelector("[data-f-mensaje]");
        if (!nombre || !correo || !contrasena) {
          mensaje.textContent = "Completá nombre, correo y una contraseña provisoria.";
          return;
        }
        const res = await fetch("api/alumnos.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, correo, contrasena }),
        });
        const cuerpo = await res.json().catch(() => ({}));
        if (!res.ok) {
          mensaje.textContent = cuerpo.error || "No se pudo guardar.";
          return;
        }
        mensaje.textContent = `Alumno "${nombre}" agregado. Ya puede iniciar sesión con ese correo y contraseña.`;
        caja.querySelectorAll("input").forEach((i) => (i.value = ""));
      });

    } else if (tipo === "agregar" && entidad === "curso") {
      caja.innerHTML = `
        <h3>Agregar curso / formulario</h3>
        <div class="campo"><label>Título</label><input type="text" data-f-titulo></div>
        <div class="campo"><label>URL</label><input type="text" placeholder="pegar URL" data-f-url></div>
        <button class="boton" data-f-guardar>Agregar curso</button>
        <p class="mensaje-admin" data-f-mensaje></p>
      `;
      panelAccion.appendChild(caja);
      caja.querySelector("[data-f-guardar]").addEventListener("click", async () => {
        const titulo = caja.querySelector("[data-f-titulo]").value.trim();
        const url = caja.querySelector("[data-f-url]").value.trim();
        if (!titulo) {
          caja.querySelector("[data-f-mensaje]").textContent = "Ponele un título al curso.";
          return;
        }
        try {
          await apiPost("api/cursos.php", { titulo, url });
          caja.querySelector("[data-f-mensaje]").textContent = `Curso "${titulo}" agregado.`;
          caja.querySelectorAll("input").forEach((i) => (i.value = ""));
        } catch (err) {
          caja.querySelector("[data-f-mensaje]").textContent = "No se pudo guardar. Revisá la conexión con la base de datos.";
        }
      });

    } else if (tipo === "editar" && entidad === "alumno") {
      caja.innerHTML = `
        <h3>Editar alumno</h3>
        <div class="campo"><label>Buscar por nombre</label><input type="text" data-f-buscar></div>
        <div data-f-resultado></div>
      `;
      panelAccion.appendChild(caja);

      let temporizadorBusquedaEditar = null;
      caja.querySelector("[data-f-buscar]").addEventListener("input", () => {
        clearTimeout(temporizadorBusquedaEditar);
        temporizadorBusquedaEditar = setTimeout(async () => {
          const termino = caja.querySelector("[data-f-buscar]").value.trim();
          const zona = caja.querySelector("[data-f-resultado]");
          zona.innerHTML = "";
          if (!termino) return;

          let encontrados = [];
          try {
            encontrados = await apiGet(`api/alumnos.php?buscar=${encodeURIComponent(termino)}`);
          } catch (err) {
            zona.innerHTML = `<p>No se pudo conectar con la base de datos.</p>`;
            return;
          }
          if (encontrados.length === 0) {
            zona.innerHTML = `<p>No se encontró ningún alumno con "${termino}".</p>`;
            return;
          }
          encontrados.forEach((a) => {
            const fila = crearElemento("div", "fila-editar");
            fila.innerHTML = `
              <input type="text" value="${a.nombre}" placeholder="Nombre y Apellido" maxlength="30" data-e-nombre>
              <input type="text" value="${a.curso ?? ""}" placeholder="Curso" maxlength="10" data-e-curso>
              <input type="text" value="${a.telefono ?? ""}" placeholder="Teléfono" maxlength="20" data-e-telefono>
              <button class="boton-chico" data-e-guardar>Guardar</button>
            `;
            fila.querySelector("[data-e-guardar]").addEventListener("click", async () => {
              const nombre = fila.querySelector("[data-e-nombre]").value.trim();
              const curso = fila.querySelector("[data-e-curso]").value.trim();
              const telefono = fila.querySelector("[data-e-telefono]").value.trim();
              await apiPut(`api/alumnos.php?id=${a.id}`, { nombre, curso, telefono });
              fila.classList.add("guardado-ok");
            });
            zona.appendChild(fila);
          });
        }, 350);
      });

    } else if (tipo === "editar" && entidad === "curso") {
      caja.innerHTML = `<h3>Editar curso / formulario</h3><div data-f-lista></div>`;
      panelAccion.appendChild(caja);
      const zona = caja.querySelector("[data-f-lista]");

      (async () => {
        let cursos = [];
        try {
          cursos = await apiGet("api/cursos.php");
        } catch (err) {
          zona.innerHTML = `<p>No se pudo conectar con la base de datos.</p>`;
          return;
        }
        cursos.forEach((c) => {
          const fila = crearElemento("div", "fila-editar");
          fila.innerHTML = `
            <input type="text" value="${c.titulo}" data-e-titulo>
            <input type="text" value="${c.url ?? ""}" placeholder="URL" data-e-url>
            <button class="boton-chico" data-e-guardar>Guardar</button>
          `;
          fila.querySelector("[data-e-guardar]").addEventListener("click", async () => {
            const titulo = fila.querySelector("[data-e-titulo]").value.trim();
            const url = fila.querySelector("[data-e-url]").value.trim();
            await apiPut(`api/cursos.php?id=${c.id}`, { titulo, url });
            fila.classList.add("guardado-ok");
          });
          zona.appendChild(fila);
        });
      })();

    } else if (tipo === "eliminar" && entidad === "alumno") {
      caja.innerHTML = `<h3>Eliminar alumno</h3><div data-f-lista></div>`;
      panelAccion.appendChild(caja);
      const zona = caja.querySelector("[data-f-lista]");

      const render = async () => {
        let alumnosLista = [];
        try {
          alumnosLista = await apiGet("api/alumnos.php");
        } catch (err) {
          zona.innerHTML = `<p>No se pudo conectar con la base de datos.</p>`;
          return;
        }
        zona.innerHTML = "";
        alumnosLista.forEach((a) => {
          const fila = crearElemento(
            "div",
            "fila-editar",
            `<span>${a.nombre} — ${a.curso || "sin curso"} — ${a.correo}</span><button class="boton-chico boton-peligro" data-e-borrar>Eliminar</button>`
          );
          fila.querySelector("[data-e-borrar]").addEventListener("click", async () => {
            await apiDelete(`api/alumnos.php?id=${a.id}`);
            render();
          });
          zona.appendChild(fila);
        });
      };
      render();

    } else if (tipo === "eliminar" && entidad === "curso") {
      caja.innerHTML = `<h3>Eliminar curso / formulario</h3><div data-f-lista></div>`;
      panelAccion.appendChild(caja);
      const zona = caja.querySelector("[data-f-lista]");

      const render = async () => {
        let cursosLista = [];
        try {
          cursosLista = await apiGet("api/cursos.php");
        } catch (err) {
          zona.innerHTML = `<p>No se pudo conectar con la base de datos.</p>`;
          return;
        }
        zona.innerHTML = "";
        cursosLista.forEach((c) => {
          const fila = crearElemento(
            "div",
            "fila-editar",
            `<span>${c.titulo}</span><button class="boton-chico boton-peligro" data-e-borrar>Eliminar</button>`
          );
          fila.querySelector("[data-e-borrar]").addEventListener("click", async () => {
            await apiDelete(`api/cursos.php?id=${c.id}`);
            render();
          });
          zona.appendChild(fila);
        });
      };
      render();
    }
  }
}

// ===== Página: Login =====
function pintarLogin(datos) {
  const cont = document.getElementById("contenido-login");
  if (!cont) return;
  const tabs = cont.querySelectorAll("[data-tab]");
  const tituloForm = cont.querySelector("[data-titulo-form]");
  const campoNombre = cont.querySelector("[data-campo-nombre]");
  const inputNombre = cont.querySelector("[data-nombre]");
  const inputCorreo = cont.querySelector("[data-correo]");
  const inputContrasena = cont.querySelector("[data-contrasena]");
  const mensaje = cont.querySelector("[data-mensaje-login]");
  const btnEnviar = cont.querySelector("[data-btn-enviar]");

  let modo = "login";

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("activo"));
      tab.classList.add("activo");
      modo = tab.dataset.tab === "registro" ? "registro" : "login";
      tituloForm.textContent = modo === "registro" ? "Registrarse" : "Iniciar Sesión";
      campoNombre.style.display = modo === "registro" ? "block" : "none";
      btnEnviar.textContent = modo === "registro" ? "Registrarme" : "Ingresar";
      if (mensaje) mensaje.textContent = "";
    });
  });

  if (!btnEnviar) return;
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
}

// ===== Utilidades para Descargas / Avisos =====
function formatearTamano(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(0) + " KB";
  return (n / (1024 * 1024)).toFixed(1).replace(".", ",") + " MB";
}

function fechaCorta(valor) {
  const d = new Date(String(valor).replace(" ", "T"));
  return isNaN(d) ? "" : d.toLocaleDateString("es-AR");
}

// Estas páginas usan textContent (y no innerHTML) para mostrar lo que escribió
// el usuario, así nadie puede meter código HTML/JS dentro de un título o aviso.
function crearTexto(tag, clase, texto) {
  const el = crearElemento(tag, clase);
  el.textContent = texto;
  return el;
}

function usuarioEsAdmin(sesion) {
  return !!(sesion && sesion.logueado && sesion.usuario.rol === "administrador");
}

// ===== Página: Descargas =====
async function pintarDescargas(datos, sesion) {
  const cont = document.getElementById("contenido-descargas");
  if (!cont) return;

  const grid = cont.querySelector("[data-grid-descargas]");
  const inputBuscar = cont.querySelector("[data-buscar-descarga]");
  const btnMostrar = cont.querySelector("[data-mostrar-subida]");
  const form = cont.querySelector("[data-form-subida]");
  const mensaje = cont.querySelector("[data-mensaje-subida]");
  const esAdmin = usuarioEsAdmin(sesion);

  let archivos = [];
  try {
    archivos = await apiGet("api/descargas.php");
  } catch (e) {
    grid.appendChild(crearTexto("p", "vacio", 'No se pudo conectar con la base de datos. Revisá que WAMP esté prendido y que la tabla "descargas" exista.'));
    return;
  }

  function renderArchivos() {
    const filtro = inputBuscar.value.trim().toLowerCase();
    const visibles = archivos.filter((a) =>
      `${a.titulo} ${a.descripcion} ${a.archivo_original}`.toLowerCase().includes(filtro)
    );

    grid.innerHTML = "";
    if (visibles.length === 0) {
      const texto = archivos.length === 0
        ? (esAdmin ? 'Todavía no hay archivos. Subí el primero con el botón "Subir archivo".' : "Todavía no hay archivos para descargar.")
        : "No encontramos archivos con esa búsqueda.";
      grid.appendChild(crearTexto("p", "vacio", texto));
      return;
    }

    visibles.forEach((a) => {
      const tarjeta = crearElemento("div", "tarjeta tarjeta-descarga");
      const extension = (a.archivo_original.split(".").pop() || "").toUpperCase();

      tarjeta.appendChild(crearTexto("span", "badge-ext", extension));
      tarjeta.appendChild(crearTexto("h3", "", a.titulo));
      if (a.descripcion) tarjeta.appendChild(crearTexto("p", "", a.descripcion));

      const meta = crearElemento("p", "meta-descarga");
      meta.appendChild(crearTexto("span", "", formatearTamano(a.tamano)));
      meta.appendChild(crearTexto("span", "", fechaCorta(a.fecha)));
      tarjeta.appendChild(meta);

      const enlace = crearTexto("a", "boton-chico", "Descargar");
      enlace.href = a.ruta;
      enlace.setAttribute("download", a.archivo_original);
      tarjeta.appendChild(enlace);

      if (esAdmin) {
        const btnBorrar = crearTexto("button", "btn-borrar-descarga", "×");
        btnBorrar.title = "Eliminar archivo";
        btnBorrar.setAttribute("aria-label", "Eliminar " + a.titulo);
        btnBorrar.addEventListener("click", async () => {
          if (!confirm(`¿Eliminar "${a.titulo}"? Esta acción no se puede deshacer.`)) return;
          await apiDelete(`api/descargas.php?id=${a.id}`);
          archivos = archivos.filter((x) => x.id !== a.id);
          renderArchivos();
        });
        tarjeta.appendChild(btnBorrar);
      }

      grid.appendChild(tarjeta);
    });
  }

  inputBuscar.addEventListener("input", renderArchivos);

  // Solo el administrador ve el formulario para subir archivos.
  if (esAdmin) {
    btnMostrar.style.display = "inline-block";
    btnMostrar.addEventListener("click", () => {
      form.style.display = form.style.display === "block" ? "none" : "block";
    });

    form.querySelector("[data-f-guardar]").addEventListener("click", async () => {
      const inputTitulo = form.querySelector("[data-f-titulo]");
      const inputDescripcion = form.querySelector("[data-f-descripcion]");
      const inputArchivo = form.querySelector("[data-f-archivo]");
      const titulo = inputTitulo.value.trim();
      const archivo = inputArchivo.files[0];

      if (!titulo || !archivo) {
        mensaje.textContent = "Completá el título y elegí un archivo.";
        return;
      }

      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("descripcion", inputDescripcion.value.trim());
      formData.append("archivo", archivo);

      mensaje.textContent = "Subiendo archivo...";
      try {
        const res = await fetch("api/descargas.php", { method: "POST", body: formData });
        const cuerpo = await res.json().catch(() => ({}));
        if (!res.ok) {
          mensaje.textContent = cuerpo.error || "No se pudo subir el archivo.";
          return;
        }
        archivos.unshift(cuerpo);
        inputTitulo.value = "";
        inputDescripcion.value = "";
        inputArchivo.value = "";
        mensaje.textContent = "Archivo subido.";
        renderArchivos();
      } catch (e) {
        mensaje.textContent = "No se pudo conectar con el servidor.";
      }
    });
  }

  renderArchivos();
}

// ===== Página: Avisos =====
const COLORES_AVISO = {
  Importante: "#ff8a80",
  Recurso: "#5ee0c9",
  Recordatorio: "#ffd166",
  General: "#7fb3ff",
};

async function pintarAvisos(datos, sesion) {
  const cont = document.getElementById("contenido-avisos");
  if (!cont) return;

  const lista = cont.querySelector("[data-lista-avisos]");
  const tabs = cont.querySelector("[data-tabs-avisos]");
  const btnNuevo = cont.querySelector("[data-nuevo-aviso]");
  const form = cont.querySelector("[data-form-aviso]");
  const mensaje = cont.querySelector("[data-mensaje-aviso]");
  const esAdmin = usuarioEsAdmin(sesion);

  let avisos = [];
  try {
    avisos = await apiGet("api/avisos.php");
  } catch (e) {
    lista.appendChild(crearTexto("p", "vacio", 'No se pudo conectar con la base de datos. Revisá que WAMP esté prendido y que la tabla "avisos" exista.'));
    return;
  }

  let filtroActual = "Todos";

  function renderTabs() {
    tabs.innerHTML = "";
    ["Todos", ...Object.keys(COLORES_AVISO)].forEach((nombre) => {
      const btn = crearTexto("button", nombre === filtroActual ? "activo" : "", nombre);
      btn.addEventListener("click", () => {
        filtroActual = nombre;
        renderTabs();
        renderAvisos();
      });
      tabs.appendChild(btn);
    });
  }

  function renderAvisos() {
    const visibles = avisos.filter((a) => filtroActual === "Todos" || a.etiqueta === filtroActual);
    lista.innerHTML = "";

    if (visibles.length === 0) {
      const texto = avisos.length === 0
        ? (esAdmin ? 'Todavía no publicaste avisos. Usá el botón "Nuevo aviso".' : "No hay avisos por ahora.")
        : "No hay avisos de este tipo.";
      lista.appendChild(crearTexto("p", "vacio", texto));
      return;
    }

    visibles.forEach((a) => {
      const item = crearElemento("article", "aviso");
      item.style.setProperty("--color-aviso", COLORES_AVISO[a.etiqueta] || COLORES_AVISO.General);

      const cabecera = crearElemento("div", "aviso-cabecera");
      cabecera.appendChild(crearTexto("h3", "", a.titulo));

      const meta = crearElemento("div", "aviso-meta");
      meta.appendChild(crearTexto("span", "chip-aviso", a.etiqueta));
      meta.appendChild(crearTexto("span", "", fechaCorta(a.fecha)));
      cabecera.appendChild(meta);

      item.appendChild(cabecera);
      item.appendChild(crearTexto("p", "", a.texto));

      if (esAdmin) {
        const btnBorrar = crearTexto("button", "btn-borrar-aviso", "×");
        btnBorrar.title = "Eliminar aviso";
        btnBorrar.setAttribute("aria-label", "Eliminar aviso " + a.titulo);
        btnBorrar.addEventListener("click", async () => {
          if (!confirm(`¿Eliminar el aviso "${a.titulo}"?`)) return;
          await apiDelete(`api/avisos.php?id=${a.id}`);
          avisos = avisos.filter((x) => x.id !== a.id);
          renderAvisos();
        });
        item.appendChild(btnBorrar);
      }

      lista.appendChild(item);
    });
  }

  if (esAdmin) {
    btnNuevo.style.display = "inline-block";
    btnNuevo.addEventListener("click", () => {
      form.style.display = form.style.display === "block" ? "none" : "block";
    });

    form.querySelector("[data-f-guardar]").addEventListener("click", async () => {
      const inputTitulo = form.querySelector("[data-f-titulo]");
      const inputTexto = form.querySelector("[data-f-texto]");
      const selectEtiqueta = form.querySelector("[data-f-etiqueta]");
      const titulo = inputTitulo.value.trim();
      const texto = inputTexto.value.trim();

      if (!titulo || !texto) {
        mensaje.textContent = "Completá el título y el mensaje del aviso.";
        return;
      }

      const res = await fetch("api/avisos.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, texto, etiqueta: selectEtiqueta.value }),
      });
      const cuerpo = await res.json().catch(() => ({}));
      if (!res.ok) {
        mensaje.textContent = cuerpo.error || "No se pudo publicar el aviso.";
        return;
      }

      avisos.unshift(cuerpo);
      inputTitulo.value = "";
      inputTexto.value = "";
      selectEtiqueta.value = "General";
      mensaje.textContent = "Aviso publicado.";
      renderAvisos();
    });
  }

  renderTabs();
  renderAvisos();
}

// ===== Página: Índice =====
async function pintarIndice(datos, sesion) {
  const cont = document.getElementById("contenido-indice");
  if (!cont) return;

  const contenedor = cont.querySelector("[data-indice]");
  const inputBuscar = cont.querySelector("[data-buscar-indice]");
  const esAdmin = usuarioEsAdmin(sesion);

  // Cada sección es { titulo, enlaces: [{ texto, href }] }
  const secciones = [
    {
      titulo: "Páginas principales",
      enlaces: datos.nav.map((n) => ({ texto: n.label, href: n.href })),
    },
    {
      titulo: "Herramientas",
      enlaces: datos.herramientas
        .filter((h) => h.href !== "admin.php" || esAdmin)
        .map((h) => ({ texto: h.label, href: h.href })),
    },
  ];

  // Tutoriales y guías salen de la base de datos; si falla, el índice sigue funcionando.
  try {
    const tutoriales = await apiGet("api/tutoriales.php");
    if (tutoriales.length) {
      secciones.push({
        titulo: "Tutoriales",
        enlaces: tutoriales.map((t) => ({ texto: t.titulo, href: "tutoriales.php" })),
      });
    }
  } catch (e) { /* sin tutoriales en el índice */ }

  try {
    const unidades = await apiGet("api/unidades.php");
    if (unidades.length) {
      secciones.push({
        titulo: "Ponete a prueba",
        enlaces: unidades.map((u) => ({ texto: `Guía ${u.numero}: ${u.titulo}`, href: "formularios.php" })),
      });
    }
  } catch (e) { /* sin guías en el índice */ }

  function renderIndice() {
    const filtro = inputBuscar.value.trim().toLowerCase();
    contenedor.innerHTML = "";
    let hayResultados = false;

    secciones.forEach((seccion) => {
      const enlaces = seccion.enlaces.filter((e) => e.texto.toLowerCase().includes(filtro));
      if (enlaces.length === 0) return;
      hayResultados = true;

      const tarjeta = crearElemento("div", "tarjeta indice-seccion");
      tarjeta.appendChild(crearTexto("h3", "", seccion.titulo));
      const ul = crearElemento("ul");
      enlaces.forEach((e) => {
        const li = crearElemento("li");
        const a = crearTexto("a", "", e.texto);
        a.href = e.href;
        li.appendChild(a);
        ul.appendChild(li);
      });
      tarjeta.appendChild(ul);
      contenedor.appendChild(tarjeta);
    });

    if (!hayResultados) {
      contenedor.appendChild(crearTexto("p", "vacio", "No encontramos nada con esa búsqueda."));
    }
  }

  inputBuscar.addEventListener("input", renderIndice);
  renderIndice();
}

// ===== Arranque =====
document.addEventListener("DOMContentLoaded", async () => {
  const datos = await cargarDatos();

  let sesion = { logueado: false };
  try {
    sesion = await apiGet("api/auth.php?accion=quien_soy");
  } catch (err) {
    // si falla la consulta de sesión, seguimos como visitante no logueado
  }

  const opciones = {
    buscador: document.body.dataset.buscador !== "false",
    hamburguesa: document.body.dataset.hamburguesa !== "false",
    marcaDerecha: document.body.dataset.marcaDerecha === "true",
  };

  construirHeader(datos, opciones, sesion);
  construirPanelHerramientas(datos, sesion);

  pintarInicio(datos);
  pintarPerfil(datos);
  pintarTutoriales(datos, sesion);
  pintarFormularios(datos, sesion);
  pintarNotas(datos);
  pintarAdmin(datos);
  pintarLogin(datos);
  pintarDescargas(datos, sesion);
  pintarAvisos(datos, sesion);
  pintarIndice(datos, sesion);
});
