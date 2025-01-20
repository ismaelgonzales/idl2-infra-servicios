const mongoose = require('mongoose');

const tareaSchema = new mongoose.Schema({
    id2: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        required: true,
    },
});

module.exports = mongoose.model('Tarea', tareaSchema);


/* {
    "id": 1,
    "title": "Hacer la compra",
    "description": "Comprar víveres para la semana",
    "completed": false
} */
    