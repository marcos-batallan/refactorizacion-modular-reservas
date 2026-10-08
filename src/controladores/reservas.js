function crearControladorReservas(servicioReservas) {
  function listarReservas(req, res) {
    res.render("reservas/lista", {
      titulo: "Reservas",
      reservas: servicioReservas.listar(),
    });
  }

  function mostrarNuevaReserva(req, res) {
    const { salasPermitidas, turnosPermitidos } =
      servicioReservas.obtenerOpciones();

    res.render("reservas/nueva", {
      titulo: "Nueva reserva",
      salasPermitidas,
      turnosPermitidos,
      errores: null,
      valores: {},
    });
  }

  function mostrarDetalleReserva(req, res) {
    const id = Number(req.params.id);
    const reserva = servicioReservas.obtenerPorId(id);
    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "No existe una reserva con ese identificador",
      });
    }
    res.render("reservas/detalle", {
      titulo: "Detalle de reserva",
      reserva,
    });
  }

  function crearReserva(req, res) {
    servicioReservas.crear(req.reservaValidada);
    res.redirect("/reservas");
  }

  function mostrarEstado(req, res) {
    res.json({
      servicio: "activo",
      reservas: servicioReservas.contar(),
      solicitudId: res.locals.solicitudId,
    });
  }

  return {
    listarReservas,
    mostrarNuevaReserva,
    mostrarDetalleReserva,
    crearReserva,
    mostrarEstado,
  };
}

module.exports = { crearControladorReservas };
