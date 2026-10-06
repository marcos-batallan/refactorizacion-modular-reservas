const express = require("express");
const morgan = require("morgan");
const expressLayouts = require("express-ejs-layouts");
const path = require("node:path");
const {
    crearIdentificadorSolicitud,
    medirDuracion,
} = require("./middleware/solicitudes");
const {
    prepararAreaReservas,
    validarReserva
} = require("./middleware/reservas");

const PORT = 3000;

async function main() {

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
            personas: 4
        },
        {
            id: 2,
            estudiante: "Marcos Batallán",
            email: "marcosbat@gmail.com",
            sala: "Sala Sur",
            fecha: "2026-09-24",
            turno: "Tarde",
            personas: 6
        },
        {
            id: 3,
            estudiante: "Juan Cruz López",
            email: "jclopez@gmail.com",
            sala: "Sala Multimedia",
            fecha: "2026-09-25",
            turno: "Noche",
            personas: 3
        },
        {
            id: 4,
            estudiante: "María Rodriguez",
            email: "mrodriguez@gmail.com",
            sala: "Sala Norte",
            fecha: "2026-09-25",
            turno: "Tarde",
            personas: 5
        }
    ];

    const servicioReservas = crearServicioReservas(reservasIniciales);
    
    let proximoId = reservas.length + 1;

    // Handler final del POST. Ya no repite la validación: solo agrega en memoria y redirige al listado.
    function crearReserva(req, res) {
        const nuevaReserva = {
            id: proximoId,
            ...req.reservaValidada,
        };
        proximoId += 1;
        reservas.push(nuevaReserva);
        res.redirect("/reservas");
    };

    const app = express();

    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "..", "views"));
    app.set("layout", "layouts/main");

    // --- Pipeline global ---
    app.use(morgan("dev")); // Middleware de terceros: registra cada solicitud en consola.
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

    app.get("/estado", (req, res) => {
        res.json({
            servicio: "activo",
            reservas: reservas.length,
            solicitudId: res.locals.solicitudId,
        });
    });

    // --- Router de reservas ---
    const reservasRouter = express.Router();
    reservasRouter.use(prepararAreaReservas);

    reservasRouter.get("/", (req, res) => {
        res.render("reservas/lista", {
            titulo: "Reservas",
            reservas,
        });
    });

    // Debe declararse antes de /:id para que "nueva" no se interprete como un id.
    reservasRouter.get("/nueva", (req, res) => {
        res.render("reservas/nueva", {
            titulo: "Nueva reserva",
            salasPermitidas,
            turnosPermitidos,
            valores: {},
            errores: [],
        });
    });

    reservasRouter.get("/:id", (req, res) => {
        const id = Number(req.params.id);
        const reserva = servicioReservas.obtenerPorId(id);

        if (!reserva) {
            return res.status(404).render("no-encontrado", {
                titulo: "Reserva no encontrada",
                mensaje: "La reserva solicitada no existe.",
            });
        }

        res.render("reservas/detalle", {
            titulo: "Detalle de reserva",
            reserva,
        });
    });

    reservasRouter.post("/", validarReserva, crearReserva);

    app.use("/reservas", reservasRouter);

    // --- Página 404: al final de todo el pipeline ---
    app.use((req, res) => {
        res.status(404).render("no-encontrado", {
            titulo: "Página no encontrada",
            mensaje: "La dirección solicitada no existe.",
        });
    });

    app.listen(PORT, () => {
        console.log(`Aplicación escuchando en http://localhost:${PORT}`);
    });
}

main().catch((error) => {
    console.error("No se pudo iniciar el servidor", error);
    process.exitCode = 1;
});