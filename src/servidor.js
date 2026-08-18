const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const express = require('express')
const conectarBaseDeDatos = require('./configuracion/baseDeDatos')
const rutasGastos = require('./rutas/gastoRutas')

const aplicacion = express()
const puerto = process.env.PUERTO || 3000

aplicacion.use(express.json())
aplicacion.use(express.static(path.join(__dirname, 'vistas')))
aplicacion.use('/api/gastos', rutasGastos)

const iniciarServidor = async () => {
    try {
        await conectarBaseDeDatos()

        aplicacion.listen(puerto, () => {
            console.log(`Servidor corriendo en http://localhost:${puerto}`)
        })
    } catch (error) {
        console.error('No se pudo iniciar el servidor:', error.message)
        process.exit(1)
    }
}

iniciarServidor()
