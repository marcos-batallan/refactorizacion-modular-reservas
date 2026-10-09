const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const path = require("node:path");

const {
  crearIdentificadorSolicitud,
  medirDuracion,
} = require("./middleware/solicitudes");
const { crearValidadorReserva } = require("./middleware/reservas");
const { crearControladorReservas } = require("./controladores/reservas");
const { crearRouterReservas } = require("./rutas/reservas");

function crearApp({ servicioReservas, formatoRegistro }) {
  const app = express();
  const validarReserva = crearValidadorReserva(servicioReservas);
  const controladorReservas = crearControladorReservas(servicioReservas);
  // --- Router de reservas ---
  const reservasRouter = crearRouterReservas(
    controladorReservas,
    validarReserva,
  );

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));
  app.set("layout", "layouts/main");

  // --- Pipeline global ---
  app.use(morgan(formatoRegistro)); // Middleware de terceros: registra cada solicitud en consola.
  app.use(crearIdentificadorSolicitud()); // Middleware personalizado global #1.
  app.use(medirDuracion); // Middleware personalizado global #2.
  app.use(expressLayouts); // Habilita el layout principal para las vistas EJS.
  app.use(express.static(path.join(__dirname, "..", "public"))); // Recursos estáticos incorporados.
  app.use(express.urlencoded({ extended: true })); // Parser incorporado para formularios.
  app.use(express.json()); // Parser incorporado para JSON (no lo usa el formulario, pero queda disponible).

  // --- Rutas de aplicación ---
  app.get("/", (req, res) => {
    res.render("inicio", { titulo: "Inicio" });
  });
  app.get("/estado", controladorReservas.mostrarEstado);

  app.use("/reservas", reservasRouter);

  // --- Página 404: al final de todo el pipeline ---
  app.use((req, res) => {
    res.status(404).render("no-encontrado", {
      titulo: "Página no encontrada",
      mensaje: "La dirección solicitada no existe.",
    });
  });

  return app;
}

module.exports = { crearApp };
