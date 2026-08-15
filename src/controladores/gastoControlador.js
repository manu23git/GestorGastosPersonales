const Gasto = require('../modelos/gastoModelo')

const ManejarError = (error, respuesta) => {
    console.error(error)

    if (error.name === 'CastError') {
        return respuesta.status(400).json({
            mensaje: 'El ID proporcionado no es válido'
        })
    }

    if (error.name === 'ValidationError') {
        const errores = Object.values(error.errors).map(
            (detalle) => detalle.message
        )

        return respuesta.status(400).json({
            mensaje: 'Los datos enviados no son válidos',
            errores
        })
    }

    return respuesta.status(500).json({
        mensaje: 'Ocurrió un error interno en el servidor'
    })
}

const ObtenerGastos = async (solicitud, respuesta) => {
    try {
        const gastos = await Gasto.find()

        respuesta.json(gastos)
    } catch (error) {
        return ManejarError(error, respuesta)
    }
}

const ObtenerPorID = async (solicitud, respuesta) => {
    try {
        const gasto = await Gasto.findById(solicitud.params.id)

        if (!gasto) {
            return respuesta.status(404).json({
                mensaje: 'Gasto no encontrado'
            })
        }

        respuesta.json(gasto)
    } catch (error) {
        return ManejarError(error, respuesta)
    }
}

const CrearGasto = async (solicitud, respuesta) => {
    try {
        const nuevoGasto = new Gasto(solicitud.body)

        await nuevoGasto.save()

        respuesta.status(201).json(nuevoGasto)
    } catch (error) {
        return ManejarError(error, respuesta)
    }
}

const ActualizarGasto = async (solicitud, respuesta) => {
    try {
        const gastoActualizado = await Gasto.findByIdAndUpdate(
            solicitud.params.id,
            solicitud.body,
            {
                new: true,
                runValidators: true
            }
        )

        if (!gastoActualizado) {
            return respuesta.status(404).json({
                mensaje: 'Gasto no encontrado'
            })
        }

        respuesta.json(gastoActualizado)
    } catch (error) {
        return ManejarError(error, respuesta)
    }
}

const EliminarGasto = async (solicitud, respuesta) => {
    try {
        const gastoEliminado = await Gasto.findByIdAndDelete(solicitud.params.id)

        if (!gastoEliminado) {
            return respuesta.status(404).json({
                mensaje: 'Gasto no encontrado'
            })
        }

        respuesta.json({
            mensaje: 'Gasto eliminado satisfactoriamente'
        })
    } catch (error) {
        return ManejarError(error, respuesta)
    }
}

const ObtenerTotalPorCategoria = async (solicitud, respuesta) => {
    try {
        const totales = await Gasto.aggregate([
            {
                $group: {
                    _id: '$Categoria',
                    total: { $sum: '$Monto' },
                    cantidad: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    categoria: '$_id',
                    total: 1,
                    cantidad: 1
                }
            },
            {
                $sort: {
                    total: -1
                }
            }
        ])

        respuesta.json(totales)
    } catch (error) {
        return ManejarError(error, respuesta)
    }
}

const ObtenerTotalPorMes = async (solicitud, respuesta) => {
    try {
        const totales = await Gasto.aggregate([
            {
                $group: {
                    _id: {
                        anio: { $year: '$Fecha' },
                        mes: { $month: '$Fecha' }
                    },
                    total: { $sum: '$Monto' },
                    cantidad: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    anio: '$_id.anio',
                    mes: '$_id.mes',
                    total: 1,
                    cantidad: 1
                }
            },
            {
                $sort: {
                    anio: -1,
                    mes: -1
                }
            }
        ])

        respuesta.json(totales)
    } catch (error) {
        return ManejarError(error, respuesta)
    }
}

module.exports = {
    ObtenerGastos,
    ObtenerPorID,
    CrearGasto,
    ActualizarGasto,
    EliminarGasto,
    ObtenerTotalPorCategoria,
    ObtenerTotalPorMes
}
