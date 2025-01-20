const express = require('express')
const router = express.Router()
const Tarea = require('../models/tarea.model')

//MIDDLEWARE
const getTarea = async (req, res, next) => {
    let tarea;
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).json(
            {
                message: 'El ID del la tarea no es válido'
            }
        )
    }

    try {
        tarea = await Tarea.findById(id);
        if (!tarea) {
            return res.status(404).json(
                {
                    message: 'La tarea no fue encontrado'
                }
            )
        }

    } catch (error) {
        return res.status(500).json(
            {
                message: error.message
            }
        )
    }

    res.tarea = tarea;
    next()
}

// Obtener todos los tareas [GET ALL]
router.get('/', async (req, res) => {
    try {
        const tareas = await Tarea.find();
        console.log('GET ALL', tareas)
        if (tareas.length === 0) {
            return res.status(204).json([])
        }
        res.json(tareas)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Crear una nueva tarea (recurso) [POST]
router.post('/', async (req, res) => {
    const { id2, title, description, completed } = req.body;

    // Validar que todos los campos estén presentes
    if (id2 === undefined || !title || !description || completed === undefined) {
        return res.status(400).json({
            message: 'Los campos id2, title, description y completed son obligatorios',
        });
    }

    // Validar y convertir los tipos de datos
    const parsedId2 = parseInt(id2, 10); // Convertir a número
    const parsedCompleted = completed === 'true' || completed === true; // Convertir a booleano

    if (isNaN(parsedId2)) {
        return res.status(400).json({ message: 'El campo id2 debe ser un número válido' });
    }

    const tarea = new Tarea({
        id2: parsedId2,
        title,
        description,
        completed: parsedCompleted,
    });

    try {
        const newTarea = await tarea.save();
        console.log(newTarea);
        res.status(201).json(newTarea);
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
});
//Ruta de GET individual 
router.get('/:id', getTarea, async (req, res) => {
    res.json(res.tarea);
})

//Ruta de PUT (puede modificar un dato ,pero necesita todo el cuerpo )
router.put('/:id', getTarea, async (req, res) => {
    try {
        const tarea = res.tarea
        tarea.id2 = req.body.id2 || tarea.id2;
        tarea.title = req.body.title || tarea.title;
        tarea.description = req.body.description || tarea.description;
        tarea.completed = req.body.completed || tarea.completed;

        const updatedTarea = await tarea.save()
        res.json(updatedTarea)
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
})
//Ruta de PATCH(modifica un dato sin la necesitada de todo el cuerpo)
// Actualizar una tarea (recurso) [PATCH]
router.patch('/:id', getTarea, async (req, res) => {

    // Validar que al menos uno de los campos sea enviado
    if (!req.body.id2 && !req.body.title && !req.body.description && req.body.completed === undefined) {
        return res.status(400).json({
            message: 'Al menos uno de estos campos debe ser enviado: id2, title, description o completed'
        });
    }

    try {
        const tarea = res.tarea;

        // Validar y convertir los campos entrantes
        if (req.body.id2 !== undefined) {
            const parsedId2 = parseInt(req.body.id2, 10);
            if (isNaN(parsedId2)) {
                return res.status(400).json({ message: 'El campo id2 debe ser un número válido' });
            }
            tarea.id2 = parsedId2;
        }

        if (req.body.completed !== undefined) {
            const parsedCompleted = req.body.completed === 'true' || req.body.completed === true;
            tarea.completed = parsedCompleted;
        }

        // Asignar los demás campos si fueron enviados
        tarea.title = req.body.title || tarea.title;
        tarea.description = req.body.description || tarea.description;

        const updatedTarea = await tarea.save();
        res.json(updatedTarea);
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
});


//Ruta de DELETE
router.delete('/:id', getTarea, async (req, res) => {
    try {
        const tarea = res.tarea
        await tarea.deleteOne({
            _id: tarea._id
        });
        res.json({
            message: `La tarea ${tarea.id} fue eliminado correctamente`
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})


module.exports = router