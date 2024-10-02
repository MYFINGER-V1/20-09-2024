const express = require('express');
const router = express.Router();
const crudUserController = require('../controllers/crudUserController');
const path = require('path');


const db = require('../models/db'); // Asegúrate de que esta ruta sea correcta
function getAdminIdFromSession(req) {
    return req.session.adminId || '';
}

// Middleware para verificar si el usuario es un administrador
async function checkAdmin(req, res, next) {
    const adminId = getAdminIdFromSession(req);

    if (!adminId) {
        return res.status(400).json({ message: 'No se valida usuario como administrador' });
    }

    try {
        const query = 'SELECT rol_id FROM Usuarios WHERE admin_id = ?';
        db.query(query, [adminId], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error al verificar el rol del administrador' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Administrador no encontrado' });
            }

            const userRole = results[0].rol_id;

            if (userRole === 1) {
                // El usuario es un administrador, continúa con la solicitud
                next();
            } else {
                // El usuario no es un administrador
                res.status(403).json({ message: 'Acceso denegado: solo los administradores pueden acceder a esta ruta.' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
}

module.exports = checkAdmin;

router.use(checkAdmin);

// Ruta para cargar el archivo HTML del CRUD (página de administración)
router.get('/crud', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/crud.html'));
});

// Rutas para el CRUD de usuarios
router.get('/users', checkAdmin,crudUserController.getUsers);          // Obtener todos los usuarios
router.get('/users/:id', crudUserController.getUserById);   // Obtener un usuario por ID
router.put('/users/:id', checkAdmin,crudUserController.updateUser);    // Actualizar un usuario
router.delete('/users/:id', checkAdmin,crudUserController.deleteUser); // Eliminar un usuario

module.exports = router;
