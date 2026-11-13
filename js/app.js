//======================================================
// Buscador Lugares Antamina 2026 — versión SOLO MAPA
// (se quitó Firebase: notificaciones, mensajes push, pánico)
//======================================================

import { cargarLugares, obtenerCarpetas } from "./data.js";
import { crearBuscador, teclado } from "./search.js";
import { crearMapa } from "./map.js";

//======================================================
// Referencias HTML
//======================================================

const input   = document.getElementById("search");
const stats   = document.getElementById("stats");
const results = document.getElementById("results");

//======================================================

let lugares = [];
let buscar  = null;
let mapa    = null;

//======================================================
// Inicio
//======================================================

async function iniciar() {

    try {

        stats.textContent = "Cargando lugares...";

        lugares = await cargarLugares();

        buscar = crearBuscador(lugares);

        mapa = crearMapa("map");

        mapa.cargarGeoJSON(lugares);

        stats.textContent = `${lugares.length} lugares cargados`;

        // Filtros de carpeta + tipo
        inicializarFiltros(lugares, mapa);

    } catch (error) {

        console.error(error);

        stats.textContent = "Error cargando lugares";

    }

}

//======================================================
// Eventos
//======================================================

input.addEventListener("input", buscarTexto);
input.addEventListener("keydown", controlarTeclado);

//======================================================
// Buscar
//======================================================

function buscarTexto() {

    const texto = input.value.trim();

    cambiarColorFondo(texto);

    buscar(texto, results, mapa, stats);

}

//======================================================
// Teclado
//======================================================

function controlarTeclado(e) {
    teclado(e, mapa);
}

//======================================================
// Fondo dinámico
//======================================================

function cambiarColorFondo(texto) {

    if (texto.length === 0) {
        document.body.style.backgroundColor = "#2c3e50";
        return;
    }

    const tono = (texto.length * 18) % 360;
    document.body.style.backgroundColor = `hsl(${tono},45%,30%)`;

}

//======================================================
// Filtros de carpeta + tipo
//======================================================

function inicializarFiltros(lugares, mapa) {
    const selectCarpeta = document.getElementById("folder-select");
    const botonesTipo   = document.querySelectorAll(".type-btn");

    if (!selectCarpeta) {
        console.warn("app.js: no existe #folder-select");
        return;
    }
    if (!mapa || typeof mapa.filtrarLugares !== "function") {
        console.warn("app.js: mapa.filtrarLugares no disponible");
        return;
    }

    const carpetas = obtenerCarpetas(lugares);
    console.info(`app.js: ${carpetas.length} carpetas detectadas`, carpetas);

    selectCarpeta.innerHTML =
        `<option value="__all__">📁 Todas las carpetas</option>` +
        carpetas.map(c =>
            `<option value="${escapeHtml(c)}">📁 ${escapeHtml(c)}</option>`
        ).join("");

    let filtroCarpeta = "__all__";
    let filtroTipo    = "all";

    function aplicar() {
        const visibles = mapa.filtrarLugares(props => {
            const okCarpeta =
                filtroCarpeta === "__all__" ||
                (props.carpeta || "(Raíz)") === filtroCarpeta;
            const okTipo =
                filtroTipo === "all" ||
                props.tipo === filtroTipo;
            return okCarpeta && okTipo;
        });
        document.getElementById("stats").textContent = `${visibles} lugares visibles`;
    }

    selectCarpeta.addEventListener("change", e => {
        filtroCarpeta = e.target.value;
        aplicar();
    });

    botonesTipo.forEach(btn => {
        btn.addEventListener("click", () => {
            botonesTipo.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            filtroTipo = btn.dataset.type;
            aplicar();
        });
    });
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
//======================================================

iniciar();
