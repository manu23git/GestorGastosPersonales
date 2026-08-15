const mongoose = require("mongoose")

const esquemaGastos = new mongoose.Schema({
    Nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
        
    }, 

    Categoria: {
        type: String,
        required: [true, 'La categoría es obligatoria'],
        trim: true
    }, 

    Monto: {
        type: Number,
        required: [true, 'El monto es obligatorio'],
        min: [1, 'El monto debe ser mayor o igual a 1']
    }, 

    Fecha: {
        type: Date,
        required: [true, 'La fecha es obligatoria'],
        default: Date.now
    },

    Descripcion: {
        type: String,
        trim: true,
    }, 
},

   {
    timestamps: true
})

const Gasto = mongoose.model("Gasto", esquemaGastos)

module.exports = Gasto
