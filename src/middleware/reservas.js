// Middleware de router: se aplica a todo lo montado bajo /reservas.
function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reservas de salas";
  next();
}

// Crea el middleware de validación utilizando el servicio de reservas.
function crearValidadorReserva(servicioReservas) {
  return function validarReserva(req, res, next) {
    const { salasPermitidas, turnosPermitidos } =
      servicioReservas.obtenerOpciones();

    const cuerpo = req.body || {};

    const valores = {
      estudiante: String(cuerpo.estudiante ?? "").trim(),
      email: String(cuerpo.email ?? "").trim(),
      sala: String(cuerpo.sala ?? "").trim(),
      fecha: String(cuerpo.fecha ?? "").trim(),
      turno: String(cuerpo.turno ?? "").trim(),
      personas: cuerpo.personas,
    };

    const personasNumero = Number(valores.personas);

    const errores = [];

    if (!valores.estudiante) {
      errores.push("El nombre del estudiante es obligatorio.");
    }
    if (!valores.email) {
      errores.push("El email es obligatorio.");
    } else if (!valores.email.includes("@")) {
      errores.push("El email debe contener un @ válido.");
    }
    if (!valores.fecha) {
      errores.push("La fecha es obligatoria.");
    }
    if (!salasPermitidas.includes(valores.sala)) {
      errores.push("Debe seleccionar una sala permitida.");
    }
    if (!turnosPermitidos.includes(valores.turno)) {
      errores.push("Debe seleccionar un turno permitido.");
    }
    if (
      !Number.isInteger(personasNumero) ||
      personasNumero < 1 ||
      personasNumero > 6
    ) {
      errores.push("La cantidad de personas debe ser un entero entre 1 y 6.");
    }

    if (errores.length > 0) {
      return res.status(400).render("reservas/nueva", {
        titulo: "Nueva reserva",
        salasPermitidas,
        turnosPermitidos,
        valores,
        errores,
      });
    }

    req.reservaValidada = {
      estudiante: valores.estudiante,
      email: valores.email,
      sala: valores.sala,
      fecha: valores.fecha,
      turno: valores.turno,
      personas: personasNumero,
    };

    next();
  };
}

module.exports = { prepararAreaReservas, crearValidadorReserva };
