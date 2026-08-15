const mongoose = require("mongoose")

const conectarBaseDeDatos = async () => {
    await mongoose.connect(process.env.URL_MONGODB)
    console.log("Base de datos conectada")
}

module.exports = conectarBaseDeDatos
