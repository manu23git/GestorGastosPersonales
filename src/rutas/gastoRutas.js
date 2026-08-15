const express = require('express')
const {
    ObtenerGastos,
    ObtenerPorID,
    CrearGasto,
    ActualizarGasto,
    EliminarGasto,
    ObtenerTotalPorCategoria,
    ObtenerTotalPorMes
} = require('../controladores/gastoControlador')

const rutas = express.Router()

rutas.get('/total/categoria', ObtenerTotalPorCategoria)
rutas.get('/total/mes', ObtenerTotalPorMes)

rutas.get('/', ObtenerGastos)
rutas.get('/:id', ObtenerPorID)
rutas.post('/', CrearGasto)
rutas.put('/:id', ActualizarGasto)
rutas.delete('/:id', EliminarGasto)

module.exports = rutas
