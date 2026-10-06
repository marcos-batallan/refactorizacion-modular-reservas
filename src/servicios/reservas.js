function crearServicioReservas(reservasIniciales) {
    
    const reservas = [...reservasIniciales];
    
    function listar() {
        return [...reservas];
    }

    function obtenerPorId(id) {
        return reservas.find((item) => item.id === id) ?? null;
    }

    function crear(datosValidados) {

    }

}