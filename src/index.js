const { crearServicioReservas } = require("./servicios/reservas");
const { crearApp } = require("./app");
const { leerConfiguracion } = require("./configuracion");

// Valores permitidos del dominio. Los comparten el middleware de validación
// (para verificar) y el controlador (para dibujar los <select> del formulario).
const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
const turnosPermitidos = ["Mañana", "Tarde", "Noche"];

// Datos iniciales en memoria. Las altas nuevas se agregan a este arreglo y se pierden al reiniciar el proceso
const reservasIniciales = [
  {
    id: 1,
    estudiante: "Mariela Gómez",
    email: "marigomez@gmail.com",
    sala: "Sala Norte",
    fecha: "2026-09-25",
    turno: "Mañana",
    personas: 4,
  },
  {
    id: 2,
    estudiante: "Marcos Batallán",
    email: "marcosbat@gmail.com",
    sala: "Sala Sur",
    fecha: "2026-09-24",
    turno: "Tarde",
    personas: 6,
  },
  {
    id: 3,
    estudiante: "Juan Cruz López",
    email: "jclopez@gmail.com",
    sala: "Sala Multimedia",
    fecha: "2026-09-25",
    turno: "Noche",
    personas: 3,
  },
  {
    id: 4,
    estudiante: "María Rodriguez",
    email: "mrodriguez@gmail.com",
    sala: "Sala Norte",
    fecha: "2026-09-25",
    turno: "Tarde",
    personas: 5,
  },
];

async function main() {
  const { puerto, formatoRegistro } = leerConfiguracion();

  const servicioReservas = crearServicioReservas({
    reservasIniciales,
    salasPermitidas,
    turnosPermitidos,
  });

  const app = crearApp({ servicioReservas, formatoRegistro });

  app.listen(puerto, () => {
    console.log(`Aplicación escuchando en http://localhost:${puerto}`);
  });
}

main().catch((error) => {
  console.error("No se pudo iniciar el servidor", error);
  process.exitCode = 1;
});
